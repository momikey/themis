import { Injectable, NotImplementedException, BadRequestException } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { User } from '../../user/user.entity';
import { UserActor } from '../definitions/actors/user.actor';
import { AP } from '../definitions/constants';
import * as URI from 'uri-js';
import { ConfigService } from '../../config/config.service';
import { ActivityService } from '../activity/activity.service';
import { activityFromObject } from '../definitions/activities/create-activity';
import { ApPostService } from '../ap-post/ap-post.service';

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
        private readonly configService: ConfigService,
        private readonly apPostService: ApPostService,
        private readonly activityService: ActivityService
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

            return this.createActor(user);
        } catch (e) {
            return Promise.reject(e);
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
        // Strictly speaking, Activities can have content. But Themis
        // expects that to only appear on the post objects themselves.
        const activity = (data.content == null)
            ? data
            : activityFromObject(data);
        
        switch (activity.type) {
            case 'Create':
                return this.apPostService.createNewGlobalPost(activity);
            case 'Delete':
            case 'Update':
            case 'Follow':
            case 'Add':
            case 'Remove':
            case 'Like':
            case 'Block':
            case 'Undo':
                throw new NotImplementedException();
            default:
                throw new BadRequestException(`Invalid activity type ${activity.type}`);
        }
    }

    /**
     * Creates an ActivityPub Actor object for the given user entity.
     *
     * @param user The database entity representing the user
     * @returns A new Actor object for the user
     * @memberof ApUserService
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

    idForUser(user: User): string {
        if (user.uri) {
            return user.uri;
        } else {
            // Same configuration needs as for groups
            const uri = URI.serialize({
                scheme: 'https',
                host: user.server,
                path: `/user/${user.name}`,
                port: this.configService.serverPort
            })

            return uri;
        }
    }
}
