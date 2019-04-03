import { Injectable, NotImplementedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { User } from '../../entities/user.entity';
import { UserActor } from '../definitions/actors/user.actor';
import { AP } from '../definitions/constants';
import * as URI from 'uri-js';
import { ConfigService } from '../../config/config.service';
import { ActivityService } from '../activity/activity.service';
import { activityFromObject } from '../definitions/activities/create-activity';
import { ApPostService } from '../ap-post/ap-post.service';
import { UserAuthenticationService } from '../../user/user-authentication/user-authentication.service';
import { Collection } from '../definitions/activities/collection-object';
import { Group } from '../../entities/group.entity';
import { compareDesc } from 'date-fns';
import { Post } from '../../entities/post.entity';
import { fromUri, Actor, ActorType } from '../definitions/actor.interface';
import { Activity } from '../../entities/activity.entity';
import { GroupService } from '../../group/group.service';

/**
 * This class creates and handles actor objects representing users.
 * These are Person Actors, in ActivityPub parlance.
 *
 * @export
 * @class ApUserService
 */
@Injectable()
export class ApUserService {
    constructor(
        private readonly userService: UserService,
        private readonly groupService: GroupService,
        private readonly configService: ConfigService,
        private readonly apPostService: ApPostService,
        private readonly activityService: ActivityService,
        private readonly accountService: UserAuthenticationService
    ) {}

    async getLocalUser(name: string): Promise<User> {
        try {
            const user = await this.userService.findLocalByName(name);

            return user;
        } catch (e) {
            Promise.reject(e);
        }
    }

    async getActorForUser(name: string): Promise<UserActor> {
        try {
            const user = await this.getLocalUser(name);

            return user.actor.object as UserActor;
        } catch (e) {
            return Promise.reject(e);
        }
    }

    async getOutbox(username: string, page?: number): Promise<Collection> {
        const user = await this.getLocalUser(username);

        if (user === undefined) {
            return Promise.reject(`User ${username} does not exist on this server`);
        } else {
            const actor = await this.getActorForUser(username);
            const outbox = actor.outbox;
            
            try {
                return this.activityService.createPagedCollection(
                    await this.activityService.getOutboxActivitiesForUser(user),
                    100, // TODO: Configuration
                    outbox,
                    page || 1
                );
            } catch (e) {
                throw new BadRequestException('Unable to fetch activities');
            }
        }
    }

    /**
     * Handle a POST request in a user's outbox. These will be AP
     * Activities, except that a bare object is also allowed; this
     * must be wrapped in a Create. Also, types are a bit wonky here,
     * so we're leaving them as "any" for the time being.
     *
     * @param username The name of the user sending the request
     * @param data The body of the request, as an AP activity or object
     * @returns The newly created activity representing the request
     * @memberof ApUserService
     */
    async acceptPostRequest(username: string, data: any): Promise<any> {        
        const user = await this.userService.findLocalByName(username);

        // Strictly speaking, Activities can have content. But Themis
        // expects that to only appear on the post objects themselves.
        const activity = (data.content == null)
            ? data
            : activityFromObject(data, user); 
        
        switch (activity.type) {
            case 'Create': {
                const postObject = this.apPostService.createNewGlobalPost(activity);
                const postEntity = await this.apPostService.submitNewGlobalPost(postObject);
                const activityEntity = {
                    sourceUser: user,
                    targetPost: postEntity,
                    type: activity.type,
                    activityObject: activity
                };

                const act = await this.activityService.save(activityEntity);
                try {
                    const result = (await this.activityService.deliver(act));
                    return result;
                } catch (e) {
                    return Promise.reject(e);
                }
            }
            case 'Delete': {
                const deletedPost = await this.apPostService.deletePostFromActivity(activity);
                const activityEntity = {
                    sourceUser: user,
                    targetPost: deletedPost,
                    type: activity.type,
                    activityObject: activity
                };

                // TODO: Handle delivery, etc.

                return (await this.activityService.save(activityEntity)).activityObject;
            }
            case 'Update': {                
                const updatedPost = await this.apPostService.updatePostFromActivity(activity);
                const activityEntity = {
                    sourceUser: user,
                    targetPost: updatedPost,
                    type: activity.type,
                    activityObject: activity
                }
                
                const act = await this.activityService.save(activityEntity);
                try {
                    const result = (await this.activityService.deliver(act));
                    return result;
                } catch (e) {
                    return Promise.reject(e);
                }
            }
            case 'Follow': {
                const toFollow = fromUri(activity.object);

                const activityEntity = {
                    sourceUser: user,
                    type: activity.type,
                    activityObject: activity
                }

                // Note that Follow activities are *requests*. We have to wait
                // until we get an Accept reply to actually follow.
                const act = await this.activityService.save(activityEntity);
                try {
                    const result = (await this.activityService.sendFollowRequest(act, toFollow.actor));
                    return result;
                } catch (e) {
                    return Promise.reject(e);
                }
            }
            case 'Add':
            case 'Remove':
                throw new NotImplementedException;
            case 'Like': {
                const likedPost = await this.apPostService.getPostEntityByUri(activity.object);

                const activityEntity = {
                    sourceUser: await this.likePost(user, likedPost),
                    targetPost: likedPost,
                    type: activity.type,
                    activityObject: activity
                }

                return (await this.activityService.save(activityEntity)).activityObject;
            }
            case 'Block':
            case 'Undo':
                throw new NotImplementedException;
            default:
                throw new BadRequestException(`Invalid activity type ${activity.type}`);
        }
    }

    async handleIncoming(username: string, data: any): Promise<any> {
        console.log("*** Incoming for user", username, data);
        
        const user = await this.userService.findLocalByName(username);

        const activity = data;
        const activityEntity = (await this.activityService.findByUri(activity.id)) || 
            this.activityService.create(activity);

        console.log("*** Entity", activityEntity);
        

        if (activityEntity.destinationUsers) {
            activityEntity.destinationUsers.push(user);
        } else {
            activityEntity.destinationUsers = [user];
        }

        switch (activity.type) {
            case 'Accept': {
                const request = await this.activityService.findByUri(activity.object);
                const source = fromUri(activity.actor);
                const withFollowers = await this.userService.getFollowers(user);

                if (source.type == ActorType.Group) {
                    this.userService.addFollowingToAccount(user, await this.groupService.findByUri(activity.actor));
                } else if (source.type == ActorType.User) {
                    this.userService.addFollowingToAccount(user, await this.userService.findByUri(activity.actor));
                } else {
                    throw new BadRequestException(`Invalid actor ${activity.activityObject.actor}`);
                }

                await this.userService.update(withFollowers);
                return (await this.activityService.save(activityEntity)).activityObject;
            }
            default:
                throw new NotImplementedException(`Invalid activity type ${activity.type}`);
        }
    }

    /**
     * Get the followers for this actor in an AP Collection.
     *
     * @param name The name of a local user
     * @returns An AP Collection object holding all following actors
     * @memberof ApUserService
     */
    async getFollowers(name: string): Promise<Collection> {
        try {
            const user = await this.userService.findLocalByName(name);

            const withFollowers = await this.userService.getFollowers(user);
            const allFollowers: (Group | User)[] = (withFollowers.groupFollowers as (Group|User)[])
                .concat(...withFollowers.userFollowers)
                .sort((a,b) => compareDesc(a.date, b.date));

            const uris = allFollowers.map((f) => f.uri);
            return this.activityService.createCollection(uris);
        } catch (e) {
            throw new NotFoundException(`User ${name} does not exist on this server`);
        }
    }

    /**
     * Get the followed actors for this actor in an AP Collection.
     *
     * @param name The name of a local user
     * @returns An AP Collection object holding all followed actors
     * @memberof ApUserService
     */
    async getFollowing(name: string): Promise<Collection> {
        try {
            const user = await this.userService.findLocalByName(name);

            const withFollowing = await this.userService.getFollowing(user);
            const allFollowing: (Group | User)[] = (withFollowing.groupFollowing as (Group|User)[])
                .concat(...withFollowing.userFollowing)
                .sort((a,b) => compareDesc(a.date, b.date));

            const uris = allFollowing.map((f) => f.uri);
            return this.activityService.createCollection(uris);
        } catch (e) {
            console.log(e);
            
            throw new NotFoundException(`User ${name} does not exist on this server`);
        }
    }

    /**
     * Get all posts this user likes.
     *
     * @param name The name of a local user
     * @returns An AP Collection object holding all liked posts
     * @memberof ApUserService
     */
    async getLikes(name: string): Promise<Collection> {
        try {
            const user = await this.userService.findLocalByName(name);

            const withLikes = await this.userService.getLikes(user);
            const uris = withLikes.liked.map((p) => p.uri);

            return this.activityService.createCollection(uris);
        } catch (e) {
            throw new NotFoundException(`User ${name} does not exist on this server`);
        }
    }

    /**
     * Add a post to a user's liked collection
     *
     * @param user The name of a local user
     * @param post The post to be liked
     * @returns
     * @memberof ApUserService
     */
    async likePost(user: User, post: Post): Promise<User> {
        return this.userService.addLike(user, post);
    }
}
