import { Injectable } from '@nestjs/common';
import { GroupService } from '../../group/group.service';
import { Group } from '../../group/group.entity';
import { GroupActor } from '../definitions/actors/group.actor';
import { AP } from '../definitions/constants';
import * as URI from 'uri-js';
import { ConfigService } from '../../config/config.service';

/**
 * This class creates and handles Group Actors, connecting them
 * to the native DB entities.
 *
 * @export
 * @class ApGroupService
 */
@Injectable()
export class ApGroupService {
    constructor(
        private readonly groupService: GroupService,
        private readonly configService: ConfigService
    ) {}

    /**
     * Retrieve a local group (i.e., one native to this server).
     *
     * @param name The name of the group to retrieve
     * @returns A Group database entity for the requested group
     * @memberof ApGroupService
     */
    async getLocalGroup(name: string): Promise<Group> {
        try {
            const group = await this.groupService.findLocalByName(name);

            return group;
        } catch (e) {
            return Promise.reject(e);
        }
    }

    /**
     * Provides an Actor object for the local group with the given name.
     *
     * @param name The name of the group
     * @returns An ActivityPub Actor object
     * @memberof ApGroupService
     */
    async getActorForGroup(name: string): Promise<GroupActor> {
        try {
            const group = await this.getLocalGroup(name);

            return this.createActor(group);
        } catch (e) {
            return Promise.reject(e);
        }
    }

    /**
     * Creates an ActivityPub Actor object from a given group entity.
     *
     * @param group The database entity representing the group
     * @returns A new Actor object for the group
     * @memberof ApGroupService
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
     * At the moment, Themis groups do not follow anyone. This method
     * thus returns an empty array for now, but we may add the feature
     * in a later version, so that's why we have it now.
     *
     * @param name The name of the selected local group
     * @returns A list of all Actors this group is following (i.e., an empty array)
     * @memberof ApGroupService
     */
    async followingForGroup(name: string): Promise<any[]> {
        return [];
    }

    private idForGroup(group: Group): string {
        if (group.uri) {
            return group.uri;
        } else {
            // We'll need a lot of configuration stuff for this
            const uri = URI.serialize({
                scheme: 'https',
                host: group.server,
                path: `/group/${group.name}`,
                port: this.configService.serverPort
            })

            return uri;
        }
    }
}
