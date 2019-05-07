import { Controller, Get, NotImplementedException, Post as HttpPost, Body, Param, MethodNotAllowedException, UseGuards, HttpCode, UseInterceptors, Query, BadRequestException, HttpException } from '@nestjs/common';
import { ApGroupService } from './ap-group.service';
import { Collection } from '../definitions/activities/collection-object';
import { AP } from '../definitions/constants';
import { ConfigService } from '../../config/config.service';
import { GroupActor } from '../definitions/actors/group.actor';
import { FederationGuard } from '../federation.guard';
import { LocationInterceptor } from '../location.interceptor';

/**
 * This controller handles routes for group actors in ActivityPub.
 * Themis groups are represented by AP actors, the same as users,
 * but they function a little differently. They're intended to be
 * completely autonomous, always open to follow requests (private
 * groups may come in later). They do not send their own requests,
 * likes, or replies, but they do forward any message posted to them.
 *
 * @export
 * @class ApGroupController
 */
@Controller('group')
export class ApGroupController {
    constructor(
        private readonly apGroupService: ApGroupService,
        private readonly configService: ConfigService
    ) {}

    /**
     * Get the actor object for a group with the given name.
     * This is the "discovery" URI for a group, and it is stored
     * directly in the database
     *
     * @param name The name of the group (unique to a server)
     * @returns The AP Actor object for the given group
     * @memberof ApGroupController
     */
    @Get('/:name')
    async getGroupActor(@Param('name') name: string): Promise<GroupActor> {
        return this.apGroupService.getActorForGroup(name);
    }

    /**
     * Get the inbox for a given group on this server. This is
     * technically an admin-only endpoint, as normal users and
     * apps won't need to inspect a group's inbox. But there's
     * really no reason not to allow GETs.
     *
     * @param name The name of the group
     * @param page The page of the inbox *if necessary)
     * @returns A collection of activities representing the group's inbox
     * @memberof ApGroupController
     */
    @Get('/:name/inbox')
    // TODO Auth guards, etc.
    async getInbox(@Param('name') name: string, @Query('page') page: number): Promise<Collection> {
        return this.apGroupService.getInbox(name, page);
    }

    /**
     * Send a message to a group's inbox. This is the primary
     * method of transmitting posts via federation, but it can
     * also be used locally. If federation is turned off, then
     * this endpoint returns a 405 Method Not Allowed status.
     *
     * @param name The name of the group on this server
     * @param body An AP Activity object
     * @returns The server response from handling the incoming message
     * (this is deliberately left vague)
     * @memberof ApGroupController
     */
    @UseGuards(FederationGuard)
    @HttpPost('/:name/inbox')
    async postToInbox(@Param('name') name: string, @Body() body): Promise<any> {
        return this.apGroupService.handleIncoming(name, body);
    }

    /**
     * Get a group's outbox. As groups are autonomous relays,
     * the outbox is effectively a list of posts in the group,
     * along with the "control" activities for accepting follow
     * requests, etc. This is a public endpoint, as restricting
     * it really isn't necessary.
     *
     * @param name The name of the group on this server
     * @param page The page of the collection, if necessary
     * @returns A Collection containing the group's outgoing messages
     * @memberof ApGroupController
     */
    @Get('/:name/outbox')
    async getOutbox(@Param('name') name: string, @Query('page') page: number): Promise<Collection> {
        return this.apGroupService.getOutbox(name, page);
    }

    /**
     * Post a message to a group's outbox. This is a private
     * endpoint intended for internal use only. It may be removed
     * in a future version.
     *
     * @param name The name of the group
     * @param body An ActivityPub activity object
     * @returns The response of handling the request (this is
     * deliberatly left vague)
     * @memberof ApGroupController
     */
    @HttpPost('/:name/outbox')
    @HttpCode(201)
    @UseInterceptors(new LocationInterceptor)
    // TODO: How do we do auth guards? Groups are automatic.
    async postToOutbox(@Param('name') name: string, @Body() body): Promise<any> {
        return this.apGroupService.acceptPostRequest(name, body);
    }

    /**
     * Retrieve a list of this group's followers. These are all
     * actors, in the AP sense, and they can be users from any
     * server. As public groups accept all follow requests, and
     * foreign users receive an entry in the local database, this
     * endpoint can get all the necessary information locally.
     *
     * @param name The name of the group on this server
     * @returns A Collection containing the group's followers
     * @memberof ApGroupController
     */
    @Get('/:name/followers')
    async getFollowers(@Param('name') name: string): Promise<Collection> {
        return this.apGroupService.getFollowers(name);
    }

    /**
     * Retrieve a group's following list. Since groups, as a rule, don't
     * follow anyone, we can just send an empty OrderedCollection
     *
     * @param name The name of the group
     * @returns An empty OrderedCollection object
     * @memberof ApGroupController
     */
    @Get('/:name/following')
    async getFollowing(@Param('name') name: string): Promise<Collection> {
        return {
            '@context': AP.Context,
            type: 'OrderedCollection',
            totalItems: 0,
            orderedItems: []
        }
    }
}
