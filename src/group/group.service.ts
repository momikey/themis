import { Injectable, MethodNotAllowedException, InternalServerErrorException } from '@nestjs/common';
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

@Injectable()
export class GroupService {
    constructor(
        @InjectRepository(Group)
        private readonly groupRepository: Repository<Group>,
        private readonly configService: ConfigService,
        private readonly serverService: ServerService
    ) {}

    async create(group: CreateGroupDto): Promise<Group> {
        const hostname = this.serverService.parseHostname(group.server);
        const server = (await this.serverService.findOrCreate(hostname)) ||
            (await this.serverService.local());
        const groupEntity = this.groupRepository.create({
            name: group.name,
            server: server,
            displayName: group.displayName,
            summary: group.summary
        });

        groupEntity.uri = groupEntity.uri || getIdForActor(groupEntity, ActorType.Group);

        return await this.groupRepository.save(groupEntity);
    }

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

    async delete(id: number): Promise<Group> {
        const group = await this.groupRepository.findOne(id);

        return await this.groupRepository.remove(group);
    }

    async findAll(): Promise<Group[]> {
        return this.groupRepository.find();
    }

    async find(id: number): Promise<Group> {
        return await this.groupRepository.findOne(id);
    }

    async findByName(name: string): Promise<Group> {
        const response = await this.groupRepository.findOne({ name: name });

        return response;
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

    // Get all "top-level" posts in a group (i.e., those without a parent).
    // We can do this by either database ID or group name.
    async getTopLevelPosts(group: string | number): Promise<Post[]> {
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

    async getFollowers(group: Group): Promise<Group> {
        return this.groupRepository.findOne(group.id,
            { relations: ['followingUsers'] });
    }

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

        console.log("*** Group", fullGroup);
        
        await this.groupRepository.save(fullGroup);
        return true;
    }

    // Run a set of filters on a group list.
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
