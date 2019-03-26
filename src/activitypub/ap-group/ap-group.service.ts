import { Injectable, BadRequestException, NotImplementedException, HttpException, ImATeapotException } from '@nestjs/common';
import { GroupService } from '../../group/group.service';
import { Group } from '../../entities/group.entity';
import { GroupActor } from '../definitions/actors/group.actor';
import { AP } from '../definitions/constants';
import * as URI from 'uri-js';
import { ConfigService } from '../../config/config.service';
import { UserService } from '../../user/user.service';
import { ActivityService } from '../activity/activity.service';
import { Activity } from '../../entities/activity.entity';

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

    }
    
    async handleIncoming(groupname: string, data: any): Promise<any> {
        const group = await this.groupService.findLocalByName(groupname);
        const groupFollowers = this.groupService.createActor(group).followers;

        const activity = data;
        const activityEntity = await this.activityService.findByUri(activity.id);

        console.log("*** Activity", data);
        

        switch (activity.type) {
            case 'Create': {
                if (activityEntity) {
                    
                    // Activity is already in the DB
                    activityEntity.targetGroups.push(group);

                    // I'm not sure if we can use the `audience` property
                    // for this, but 
                    if (!activity.audience) {
                        activity.audience = [groupFollowers];
                    } else if (activity.audience instanceof Array) {
                        activity.audience.push(groupFollowers);
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
                const user = this.userService.findByUri(data.actor);
                
                console.log("*** Follow", user);
                throw new ImATeapotException();
            }
            default:
                throw new NotImplementedException;
                // throw new BadRequestException(`Invalid activity type ${activity.type}`);
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

            return this.groupService.createActor(group);
        } catch (e) {
            return Promise.reject(e);
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
