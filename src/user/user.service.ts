import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dtos/create-user.dto';
import { ConfigService } from '../config/config.service';
import { ServerService } from '../server/server.service';
import { getIdForActor, ActorType } from '../activitypub/definitions/actor.interface';
import { Post } from '../entities/post.entity';
import { UserActor } from '../activitypub/definitions/actors/user.actor';
import { AP } from '../activitypub/definitions/constants';
import * as URI from 'uri-js';
import { Group } from '../entities/group.entity';
import { ActorEntity } from '../entities/actor.entity';
import { UpdateUserDto } from '../dtos/update-user-profile.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService,
        private readonly serverService: ServerService
    ) {}

    /**
     * Create a new user in the database. This doesn't have to be
     * connected to an authentication record, and it isn't necessarily
     * a user on our server.
     *
     * @param user A DTO containing the user data
     * @returns The new User entity
     * @memberof UserService
     */
    async create(user: CreateUserDto): Promise<User> {
        const hostname = this.serverService.parseHostname(user.server);
        const server = (await this.serverService.findOrCreate(hostname)) ||
            (await this.serverService.local());
        const userEntity = this.userRepository.create({
            name: user.name,
            server: server,
            displayName: user.displayName,
            summary: user.summary || '',
            icon: user.iconUrl || ''
        });

        userEntity.uri = userEntity.uri || getIdForActor(userEntity, ActorType.User);

        const existingActor = await this.userRepository.manager.findOne(ActorEntity, {
            uri: userEntity.uri
        });       

        if (!existingActor) {
            // This is a new user
            if (this.serverService.isLocal(server)) {
                const actor = this.createActor(userEntity);
                userEntity.actor = this.createActorEntity(actor);
            } else {
                // Non-local server, so we need to fetch actor info,
                // but that probably should be handled by the AP layer.
            }
        } else {
            // User already exists as an actor in the DB, so just use that
            userEntity.actor = existingActor;
        }

        return this.userRepository.save(userEntity);
    }

    /**
     * Create an "empty" user entry based on only a username. This
     * leaves all other fields blank. (We could do the same thing
     * by making the DTO fields optional, but breaking it out into
     * its own method lets us put the validation logic here, instead
     * of cluttering up the main "create" function.)
     *
     * @param username The name of the user to create
     * @returns A new user on this server
     * @memberof UserService
     */
    async createEmptyUserEntry(username: string): Promise<User> {
        if (await this.findByName(username)) {
            throw new Error(`Username ${username} already in database`);
        }

        const userObject: CreateUserDto = {
            name: username,
            server: this.serverService.localHostname(),
            displayName: username,
        }

        return this.create(userObject);

        // const userEntity = this.userRepository.create({
        //     name: username,
        //     server: await this.serverService.local(),
        //     displayName: username,
        //     summary: '',
        //     icon: ''
        // });

        // userEntity.uri = userEntity.uri || getIdForActor(userEntity, ActorType.User);
        // userEntity.actor = this.createActorEntity(this.createActor(userEntity));

        // return this.userRepository.save(userEntity);
    }

    /**
     * Update the database entry for a user on this server.
     *
     * @param user A DTO with the updated data
     * @returns The updated DB entity for the user
     * @memberof UserService
     */
    async updateLocalUser(user: UpdateUserDto): Promise<User> {
        const entity = await this.findLocalByName(user.name);

        // Copy new data to DB entity
        for (const prop in user) {
            if (user[prop] && user[prop] !== entity[prop]) {
                entity[prop] = user[prop];
            }
        }

        // Save to DB
        return this.userRepository.save(entity);
    }

    /**
     * Update a user's database entry.
     *
     * @param user A User entity, possibly with fields changed
     * @returns The updated entity, now saved in the database
     * @memberof UserService
     */
    async update(user: User): Promise<User> {
        return this.userRepository.save(user);
    }

    /**
     * Delete a user from the database. If it is a local user,
     * this doesn't remove the authentication record; that is
     * handled elsewhere.
     * 
     * TODO: We need to make this take a DTO instead, so we
     * can tell the difference between local and global users.
     *
     * @param name The name of the user to delete
     * @returns The deleted user's DB entity
     * @memberof UserService
     */
    async delete(name: string): Promise<User> {
        try {
            const user = await this.findByName(name);

            return await this.userRepository.remove(user);
        } catch (e) {
            throw new Error(`User ${name} does not exist`);
        }
    }

    /**
     * Get a list of all users this server knows about.
     *
     * @returns An array of User entities
     * @memberof UserService
     */
    async findAll(): Promise<User[]> {
        return await this.userRepository.find();
    }

    /**
     * Get the user with a given database ID. These are specific
     * to this server.
     *
     * @param id The ID number for a user
     * @returns The database entity for that user
     * @memberof UserService
     */
    async find(id: number): Promise<User> {
        return this.userRepository.findOneOrFail(id);
    }

    /**
     * Get a user given a username.
     * 
     * TODO: This probably needs to be changed to account for
     * local vs. global users. Or we can take it out and change
     * things to call a more specific method instead.
     *
     * @param name The name of the user
     * @returns The User with that name
     * @memberof UserService
     */
    async findByName(name: string): Promise<User> {
        return this.userRepository.findOne({ name: name });
    }

    /**
     * Returns the User entity representing the user with the given name
     * on this server.
     *
     * @param name The name of the user to retrieve
     * @returns A User DB entity
     * @memberof UserService
     */
    async findLocalByName(name: string): Promise<User> {
        try {
            const response = await this.userRepository.findOneOrFail({
                name: name,
                server: await this.serverService.local()
            });

            return response;
        } catch (e) {
            return Promise.reject(new Error(`User ${name} does not exist on this server`));
        }
    }

    /**
     * Find a global user (i.e., a user on any server).
     *
     * @param name The name of the user
     * @param server The server's hostname
     * @returns A User entity
     * @memberof UserService
     */
    async findGlobalByName(name: string, server: string): Promise<User> {
        const serverEntity = await this.serverService.find(this.serverService.parseHostname(server));

        try {
            const response = await this.userRepository.findOneOrFail({
                name,
                server: serverEntity
            });

            return response;
        } catch (e) {
            return Promise.reject(new Error(`Cannot find user ${name}@${server}`));
        }
    }

    /**
     * Find the user with a given profile URI. This is mainly intended
     * for the ActivityPub layer.
     *
     * @param uri A profile URI
     * @returns The user with that URI
     * @memberof UserService
     */
    async findByUri(uri: string): Promise<User> {
        return this.userRepository.findOneOrFail({ uri });
    }

    /**
     * Get a user's likes list.
     *
     * @param user A User entity
     * @returns The same user, but with the `likes` property containing
     * an array of posts
     * @memberof UserService
     */
    async getLikes(user: User): Promise<User> {
        return this.userRepository.findOne(user.id, { relations: ['liked'] });
    }

    /**
     * Add a post to a user's likes list.
     *
     * @param user The User entity
     * @param post The Post entity to like
     * @returns The user, with the post added to the `likes` array
     * @memberof UserService
     */
    async addLike(user: User, post: Post): Promise<User> {
        const result = await this.getLikes(user);

        result.liked.push(post);
        return this.userRepository.save(result);
    }

    /**
     * Get all groups and users following this user.
     * (Groups don't actually follow at present, but this may change,
     * and it doesn't really hurt.)
     *
     * @param user The user entity
     * @returns The same entity, but with followers loaded into it
     * @memberof User
     */
    async getFollowers(user: User): Promise<User> {
        return this.userRepository.findOne(user.id,
             { relations: ['userFollowers', 'groupFollowers'] });
    }

    /**
     * Add a follower to a user's account. This is tricky, because
     * we can theoretically have either another user or a group.
     * In practice, groups don't follow, but that may change later.
     *
     * @param user The DB entity for the user
     * @param follower The DB entity for the follower, either a user or group
     * @returns The updated user
     * @memberof UserService
     */
    async addFollowerToAccount(user: User, follower: User | Group): Promise<User> {
        const result = await this.getFollowers(user);

        if (follower instanceof User) {
            result.userFollowers.push(follower);
        } else if (follower instanceof Group) {
            result.groupFollowers.push(follower);
        } else {
            throw new Error("This can't happen");
        }

        return this.userRepository.save(result);
    }

    /**
     * Get all users or groups this user is following.
     *
     * @param user The user entity
     * @returns The same entity, but with following users/groups loaded into it
     * @memberof User
     */
    async getFollowing(user: User): Promise<User> {
        return this.userRepository.findOne(user.id,
             { relations: ['userFollowing', 'groupFollowing'] });
    }

    /**
     * Follow another entity, whether user or group. This adds the target
     * to this user's following list.
     *
     * @param user The user entity
     * @param follow The entity (user or group) to be followed
     * @returns The updated user
     * @memberof UserService
     */
    async addFollowingToAccount(user: User, follow: User | Group): Promise<User> {
        const result = await this.getFollowing(user);
        
        if (follow instanceof User) {
            result.userFollowing.push(follow);
        } else if (follow instanceof Group) {
            result.groupFollowing.push(follow);
        } else {
            throw new Error("This can't happen");
        }

        return this.userRepository.save(result);
    }

    /**
     * Attach an Actor object to a user. This is used for
     * ActivityPub purposes.
     *
     * @param user The user entity
     * @param actor The actor object
     * @returns The updated user, now with the actor object added
     * @memberof UserService
     */
    async attachActor(user: User, actor: UserActor): Promise<User> {
        const withActor = await this.userRepository.findOne(user.id,
            { relations: ['actor'] });
        
        withActor.actor = this.createActorEntity(actor);
        
        return this.userRepository.save(withActor);
    }

    /**
     * Create an actor entity for a user. Actors are needed for
     * ActivityPub communication, and it's easier to store them
     * than to regenerate them every time they're required.
     *
     * @param actor An AP actor object representing the user
     * @returns The DB entity for the actor
     * @memberof UserService
     */
    createActorEntity(actor: UserActor): ActorEntity {
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
     * Creates an ActivityPub Actor object for the given user entity.
     *
     * @param user The database entity representing the user
     * @returns A new Actor object for the user
     * @memberof UserService
     */
    createActor(user: User): UserActor {
        const idAddress = this.idForUser(user);
        return {
            '@context': AP.Context,
            id: idAddress,
            type: 'Person',
            name: user.displayName || user.name,
            preferredUsername: user.name,
            summary: user.summary,
            icon: user.icon,

            inbox: `${idAddress}/${AP.InboxAddress}/`,
            outbox: `${idAddress}/${AP.OutboxAddress}/`,
            followers: `${idAddress}/${AP.FollowersAddress}/`,
            following: `${idAddress}/${AP.FollowingAddress}/`
        }
    }

    /**
     * Construct the base URI for a user. This is intended
     * only for local users; for foreign ones, they'll come
     * with their own, and it may not be in the same format
     * Themis uses.
     *
     * @param user The user entity
     * @returns The base URI for that user
     * @memberof UserService
     */
    idForUser(user: User): string {
        if (user.uri) {
            return user.uri;
        } else {
            // Same configuration needs as for groups
            const uri = URI.serialize({
                scheme: user.server.scheme,
                host: user.server.host,
                port: user.server.port,
                path: `/user/${user.name}`
            })

            return uri;
        }
    }
}
