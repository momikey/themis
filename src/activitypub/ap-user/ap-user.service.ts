import { Injectable } from '@nestjs/common';
import { UserService } from '../..//user/user.service';
import { User } from '../..//user/user.entity';
import { UserActor } from '../definitions/actors/user.actor';
import { AP } from '../definitions/constants';

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
        private readonly userService: UserService
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

    private idForUser(user: User): string {
        return `https://${user.server}/user/${user.name}`
    }
}
