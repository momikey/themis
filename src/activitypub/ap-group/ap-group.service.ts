import { Injectable, BadRequestException, NotImplementedException, HttpException, ImATeapotException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { GroupService } from '../../group/group.service';
import { Group } from '../../entities/group.entity';
import { GroupActor } from '../definitions/actors/group.actor';
import { AP } from '../definitions/constants';
import * as URI from 'uri-js';
import { ConfigService } from '../../config/config.service';
import { UserService } from '../../user/user.service';
import { ActivityService } from '../activity/activity.service';
import { Activity } from '../../entities/activity.entity';
import { User } from '../../entities/user.entity';
import { compareDesc } from 'date-fns';
import { Collection } from '../definitions/activities/collection-object';
import { fromUri } from '../definitions/actor.interface';

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
        private readonly userService: UserService,
        private readonly activityService: ActivityService,
        private readonly configService: ConfigService
    ) {}

    async acceptPostRequest(groupname: string, data: any): Promise<any> {
        const group = await this.groupService.findLocalByName(groupname);

        // Note that groups, since they're auto-controlled, won't send
        // bare objects without a surrounding activity. But we'll still
        // set up a new variable here, just in case we need to do some
        // processing later on. (Or when we get better types.)
        const activity = data;

        switch (activity.type) {
            case "Accept": {
                const request = await this.activityService.findByUri(activity.object);
                const toAccept = request.sourceUser;

                const acceptEntity = {
                    sourceGroup: group,
                    destinationUsers: [toAccept],
                    type: activity.type,
                    activityObject: activity
                };

                const act = await this.activityService.save(acceptEntity);

                try {
                    const result = (await this.activityService.deliverTo(act, [activity.target]));

                    return act.activityObject;
                } catch (e) {
                    return Promise.reject(e);
                }
            }
            case "Create":
            case "Update":
            case "Delete":
            case "Follow":
            case "Add":
            case "Remove":
            case "Like":
            case "Block":
            case "Undo":
            case "Reject":
                throw new ImATeapotException();
            default:
                throw new BadRequestException(`Invalid activity type ${activity.type}`);
        }
        throw new InternalServerErrorException("Something went wrong");
    }
    
    async handleIncoming(groupname: string, data: any): Promise<any> {
        const group = await this.groupService.findLocalByName(groupname);

        const activity = data;
        const activityEntity = await this.activityService.findByUri(activity.id) || 
            this.activityService.create(activity);

        if (activityEntity.destinationGroups) {
            activityEntity.destinationGroups.push(group);
        } else {
            activityEntity.destinationGroups = [group];
        }

        switch (activity.type) {
            case 'Create': {
                if (activityEntity.uri) {
                    
                    // Activity is already in the DB
                    activityEntity.destinationGroups.push(group);

                    // I'm not sure if we can use the `audience` property
                    // for this, but 
                    if (!activity.audience) {
                        activity.audience = [group.actor.followers];
                    } else if (activity.audience instanceof Array) {
                        activity.audience.push(group.actor.followers);
                    } else {
                        throw new BadRequestException;
                    }

                    const saved = await this.activityService.save(activityEntity);
                    return this.deliverToFollowers(saved, group);
                } else {
                    // New activity, so from an outside server
                    // TODO: Handle this
                }
                break;
            }
            case 'Follow': {
                const user = await this.userService.findByUri(data.actor);
                const saved = await this.activityService.save(activityEntity);

                const result = await this.groupService.addFollower(group, user);
                if (result) {
                    // Send an Accept request if updated
                    const accept = this.activityService.createAcceptActivity(
                        group.uri,
                        activity.id,
                        user.uri
                    )

                    const response = await this.acceptPostRequest(group.name, accept);
                    return response;
                }

                return result;
            }
            default:
                throw new NotImplementedException;
                // throw new BadRequestException(`Invalid activity type ${activity.type}`);
        }
    }

    /**
     * Get the activities in a group's outbox, as per AP spec.
     *
     * @param groupname The name of the local group
     * @param [page]
     * @returns
     * @memberof ApGroupService
     */
    async getOutbox(groupname: string, page?: number): Promise<Collection> {
        const group = this.getLocalGroup(groupname);

        try {
            (await group);
        } catch (e) {
            throw new NotFoundException(`Group ${groupname} does not exist on this server`);
        }

        try {
            const outbox = (await this.getActorForGroup(groupname)).outbox;

            return this.activityService.createPagedCollection(
                await this.activityService.getOutboxActivitiesForGroup(await group),
                100, // TODO configuration
                outbox,
                page || 1
            );
        } catch (e) {
            throw new BadRequestException("Unable to fetch activities");
        }
    }

    async getInbox(groupname: string, page?: number): Promise<Collection> {
        const group = this.getLocalGroup(groupname);

        try {
            (await group);
        } catch (e) {
            throw new NotFoundException(`Group ${groupname} does not exist on this server`);
        }

        try {
            const inbox = (await this.getActorForGroup(groupname)).inbox;

            return this.activityService.createPagedCollection(
                await this.activityService.getInboxActivitiesForGroup(await group),
                100, // TODO configuration
                inbox,
                page || 1
            );
        } catch (e) {
            throw new BadRequestException("Unable to fetch activities");
        }
    }

    /**
     * Get the followers for this actor in an AP Collection.
     *
     * @param name The name of a local group
     * @returns An AP Collection object holding all following actors
     * @memberof ApGroupService
     */
    async getFollowers(name: string): Promise<Collection> {
        try {
            const group = await this.groupService.findLocalByName(name);

            const withFollowers = await this.groupService.getFollowers(group);
            const allFollowers: User[] = withFollowers.followingUsers
                .sort((a,b) => compareDesc(a.date, b.date));

            const uris = allFollowers.map((f) => f.uri);
            return this.activityService.createCollection(uris);
        } catch (e) {
            throw new NotFoundException(`Group ${name} does not exist on this server`);
        }
    }

    async deliverToFollowers(activity: Activity, group: Group): Promise<Activity> {
        throw new ImATeapotException;
    }

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

            return group.actor.object as GroupActor;
        } catch (e) {
            throw new NotFoundException(`Group ${name} does not exist on this server`);
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
}
