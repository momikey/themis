import { Injectable, MethodNotAllowedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from '../entities/group.entity';
import { CreateGroupDto } from '../dtos/create-group.dto';
import { Post } from '../entities/post.entity';
import { ConfigService } from '../config/config.service';
import { UpdateGroupDto } from '../dtos/update-group.dto';
import { GroupFilterEntry, GroupFilter } from '../filter/group-filter';
import { ServerService } from '../server/server.service';
import { getIdForActor, ActorType } from '../activitypub/definitions/actor.interface';
import { GroupActor } from '../activitypub/definitions/actors/group.actor';
import { AP } from '../activitypub/definitions/constants';
import * as URI from 'uri-js';
import { User } from '../entities/user.entity';
import { ActorEntity } from '../entities/actor.entity';

/**
 * Service to handle groups. In Themis, these are entities
 * in their own right, autonomous actors that house a collection
 * of threads (posts and their children) and relay them to
 * any users who follow.
 *
 * @export
 * @class GroupService
 */
@Injectable()
export class GroupService {
    constructor(
        @InjectRepository(Group)
        private readonly groupRepository: Repository<Group>,
        private readonly configService: ConfigService,
        private readonly serverService: ServerService
    ) {}

    /**
     * Create a new group. This can be either a local group
     * on this server or a foreign one we've found through
     * federation.
     *
     * @param group A DTO containing the important data for the group
     * @returns The group's DB entity
     * @memberof GroupService
     */
    async create(group: CreateGroupDto): Promise<Group> {
        const hostname = 
            (group.server && this.serverService.parseHostname(group.server)) || null;
        const server = (hostname && await this.serverService.findOrCreate(hostname)) ||
            (await this.serverService.local());
        const groupEntity = this.groupRepository.create({
            name: group.name,
            server: server,
            displayName: group.displayName,
            summary: group.summary || ''
        });

        groupEntity.uri = groupEntity.uri || getIdForActor(groupEntity, ActorType.Group);

        const existingActor = await this.groupRepository.manager.findOne(ActorEntity, {
            uri: groupEntity.uri
        });

        if (!existingActor) {
            if (this.serverService.isLocal(server)) {
                const actor = this.createActor(groupEntity);
                groupEntity.actor = this.createActorEntity(actor);
            } else {
                // Non-local server, so we need to fetch actor info,
                // but that probably should be handled by the AP layer.
            }
        } else {
            groupEntity.actor = existingActor;
        }

        return await this.groupRepository.save(groupEntity);
    }

    /**
     * Update an existing group. This can change its name, description,
     * or other properties. For foreign groups, we'll only need to do
     * this in response to certain incoming control messages.
     *
     * @param group A DTO containing the updated fields
     * @returns The updated group entity
     * @memberof GroupService
     */
    async update(group: UpdateGroupDto): Promise<Group> {
        const hasOldGroup = (await this.groupRepository.count({ id: group.id })) > 0;
        if (hasOldGroup) {
            // This is an update, so actually update the entry
            const hostname = this.serverService.parseHostname(group.server);
            const server = (await this.serverService.findOrCreate(hostname)) ||
                (await this.serverService.local());
            
            // Change server as text to server as object
            const entity: any = group;
            entity.server = server;
    
            return this.groupRepository.save(entity);
        } else {
            // You can't update something that's not there
            return Promise.reject(new MethodNotAllowedException());
        }
    }

    /**
     * Delete a group. This is an administrative task that should
     * not be undertaken lightly. Deleting a group doesn't remove
     * its posts, as those can also be directed at other groups.
     * Nor does it remove users who have posted to it.
     *
     * @param id The database ID of the group to delete
     * @returns The DB entity for the deleted group
     * @memberof GroupService
     */
    async delete(id: number): Promise<Group> {
        const group = await this.groupRepository.findOne(id);

        return await this.groupRepository.remove(group);
    }

    /**
     * Get a list of all the groups this server knows about.
     *
     * @returns An array of group entities
     * @memberof GroupService
     */
    async findAll(): Promise<Group[]> {
        return this.groupRepository.find();
    }

    /**
     * Get a list of all groups this server knows about,
     * sorted by a specific field. (Note that this doesn't
     * have much in the way of validation yet.)
     *
     * @param sortBy The field to sort on
     * @param [descending] Whether to sort in descending or ascending order
     * (optional, default is ascending)
     * @returns An array of group entities, sorted by the given criteria
     * @memberof GroupService
     */
    async findAllSorted(sortBy: string, descending?: boolean): Promise<Group[]> {
        const order: any = {};
        order[`${sortBy}`] = descending ? 'DESC' : 'ASC';

        return this.groupRepository.find({ order });
    }

    /**
     * Given an ID, retrieve the group that has that ID.
     * Note that these are for this server only; foreign
     * groups will have different IDs on their "home" server.
     *
     * @param id The database ID of a group
     * @returns The entity for the group, if it exists
     * @memberof GroupService
     */
    async find(id: number): Promise<Group> {
        return await this.groupRepository.findOne(id);
    }

    /**
     * Get the group on this server with the given name.
     *
     * @param name The name of a group on this server
     * @returns The entity for the group, if it exists
     * @memberof GroupService
     */
    async findByName(name: string): Promise<Group> {
        const response = await this.groupRepository.findOne({ name: name });

        return response;
    }

    /**
     * Get the group with the given URI.
     *
     * @param uri The URI of the group
     * @returns The entity for the group, if it exists
     * @memberof GroupService
     */
    async findByUri(uri: string): Promise<Group> {
        return this.groupRepository.findOne({ uri });
    }

    /**
     * Returns a Group entity representing the group with the given name
     * on this server.
     *
     * @param name The name of the group
     * @returns The database entity representing the group
     * @memberof GroupService
     */
    async findLocalByName(name: string): Promise<Group> {
        try {
            const response = await this.groupRepository.findOneOrFail({
                name: name,
                server: await this.serverService.local()
            });

            return response;
        } catch (e) {
            return Promise.reject(new Error(`Group ${name} does not exist on this server`));
        }
    }

    /**
     * Returns a Group entity representing a group on any server this
     * one knows about, given the group's name and originating server.
     *
     * @param name The name of the group
     * @param server The group's home server
     * @returns The database entity representing the group
     * @memberof GroupService
     */
    async findGlobalByName(name: string, server: string): Promise<Group> {
        try {
            const serverEntity = await this.serverService.find(
                this.serverService.parseHostname(server));

            const response = await this.groupRepository.findOneOrFail({
                name,
                server: serverEntity
            });

            return response;
        } catch (e) {
            return Promise.reject(new Error(`Cannot find group ${name}@${server}`));
        }
    }

    async findByIds(ids: number[]): Promise<Group[]> {
        return this.groupRepository.findByIds(ids);
    }

    /**
     * Get all "top-level" posts in a group (i.e., those without a parent).
     * We can do this by either database ID or group name.
     *
     * @deprecated
     * @param group
     * @returns
     * @memberof GroupService
     */
    async getTopLevelPostsOld(group: string | number): Promise<Post[]> {
        // const groupEntity = await (typeof group === 'number'
        //     ? this.find(group)
        //     : this.findByName(group)
        // );

        const groupId = (typeof group === 'number'
            ? group
            : (await this.findByName(group)).id
        );

        const response = await this.groupRepository
            .createQueryBuilder('groups')
            .leftJoin('groups.posts', 'post')
            .leftJoin('post.sender', 'sender')
            .select(['groups', 'post.id', 'post.subject', 'sender', 'post.timestamp', 'post.uuid'])
            // .leftJoinAndSelect('groups.posts', 'post')
            .where('groups.id = :id', { id: groupId })
            .andWhere('post.parentId is null')
            .getOne();

        return response.posts;
    }

    /**
     * Get the top-level posts for a group (all posts without parents).
     *
     * @param group The database ID of the group
     * @param [since] An optional timestamp;; if given, only posts since
     * this time will be returned
     * @returns A list of all posts in the group, or all since the given time
     * @memberof GroupService
     */
    async getTopLevelPosts(group: number, since? : number): Promise<Post[]> {
        const sinceDate = new Date(since || 0).toJSON();

        const g = (await this.groupRepository.findOne(group, { relations: ['posts']}));
        
        if (!g.posts || !g.posts.length) {
            return [];
        } else {
            const response = this.groupRepository
                .createQueryBuilder('groups')
                .leftJoinAndSelect('groups.posts', 'post')
                .leftJoinAndSelect('post.sender', 'sender')
                .orderBy('post.timestamp', 'DESC')
                .where('groups.id = :id', { id: group })
                .andWhere('post.parentId is null')
                .andWhere('post.timestamp >= :time', { time: sinceDate });

            const posts = (await response.getOne()).posts;

            return posts;
        }
    }

    /**
     * Get a list of users who are following this group.
     *
     * @param group A group entity
     * @returns The entity, but with the following users included
     * @memberof GroupService
     */
    async getFollowers(group: Group): Promise<Group> {
        return this.groupRepository.findOne(group.id,
            { relations: ['followingUsers'] });
    }

    /**
     * Add a follower to a group
     *
     * @param group The entity for the group
     * @param user The entity for the following user
     * @returns Whether the user was added to the followers list
     * @memberof GroupService
     */
    async addFollower(group: Group, user: User): Promise<boolean> {
        const fullGroup = await this.groupRepository.findOne(group.id,
            { relations: ['followingUsers'] });

        if (!fullGroup.followingUsers) {
            fullGroup.followingUsers = [user];
        } else if (!fullGroup.followingUsers.includes(user)) {
            fullGroup.followingUsers.push(user);
        } else {
            return false;
        }

        await this.groupRepository.save(fullGroup);
        return true;
    }

    /**
     * Given an ActivityPub actor, add it to the appropriate group.
     * (TODO: Do we even need this? I seriously can't remember why
     * I even wrote it.)
     *
     * @param group The group entity
     * @param actor The actor object for the group
     * @returns The updated group
     * @memberof GroupService
     */
    async attachActor(group: Group, actor: GroupActor): Promise<Group> {
        const withActor = await this.groupRepository.findOne(group.id,
            { relations: ['actor'] });
        
        withActor.actor = this.createActorEntity(actor);
        
        return this.groupRepository.save(withActor);
    }

    /**
     * Create an actor database entity. This doesn't add it to the DB.
     *
     * @param actor The actor object
     * @returns The entity for the actor
     * @memberof GroupService
     */
    createActorEntity(actor: GroupActor): ActorEntity {
        const entity = new ActorEntity();

        entity.uri = actor.id;
        entity.inbox = actor.inbox;
        entity.outbox = actor.outbox;
        entity.followers = actor.followers;
        entity.following = actor.following;
        entity.object = actor;

        return entity;
    }

    /**
     * Run a set of filters on a group list.
     *
     * @deprecated
     * @param groups
     * @param filters
     * @returns
     * @memberof GroupService
     */
    filterGroups(groups: Group[], filters: GroupFilterEntry[]): Group[] {
        const filterRunner = new GroupFilter(filters);

        return filterRunner.execute(groups);
    }

    /**
     * Creates an ActivityPub Actor object from a given group entity.
     *
     * @param group The database entity representing the group
     * @returns A new Actor object for the group
     * @memberof GroupService
     */
    createActor(group: Group): GroupActor {
        const idAddress = this.idForGroup(group);

        return {
            '@context': AP.Context,
            id: idAddress,
            type: 'Group',
            name: group.displayName || group.name,
            preferredUsername: group.name,

            summary: group.summary,

            inbox: `${idAddress}/${AP.InboxAddress}/`,
            outbox: `${idAddress}/${AP.OutboxAddress}/`,
            followers: `${idAddress}/${AP.FollowersAddress}/`,
            following: `${idAddress}/${AP.FollowingAddress}/`
        }
    }

    /**
     * Get the URI for a group. If it isn't in the DB,
     * then this method creates it based on the Themis standard
     * format for groups.
     *
     * @param group The group entity
     * @returns The URI of the group
     * @memberof GroupService
     */
    idForGroup(group: Group): string {
        if (group.uri) {
            return group.uri;
        } else {
            // We'll need a lot of configuration stuff for this
            const uri = URI.serialize({
                scheme: group.server.scheme,
                host: group.server.host,
                port: group.server.port,
                path: `/group/${group.name}`
            })

            return uri;
        }
    }
}
