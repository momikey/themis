import { Controller, Get, Param, Body, Post as HttpPost, HttpCode, UseInterceptors, UseGuards, Query, Request, Headers } from '@nestjs/common';
import { ApUserService } from './ap-user.service';
import { ConfigService } from '../../config/config.service';
import { UserActor } from '../definitions/actors/user.actor';
import { LocationInterceptor } from '../location.interceptor';
import { ContentTypeGuard } from '../content-type.guard';
import { FederationGuard } from '../federation.guard';
import { AuthGuard } from '@nestjs/passport';
import { Collection } from '../definitions/activities/collection-object';

/**
 * This controller handles user actions and data, including
 * profiles, posting, following, liking, etc. Unlike groups,
 * users have agency, so this will have to be secured.
 *
 * @export
 * @class ApUserController
 */
@Controller('user')
export class ApUserController {
    constructor(
        private readonly apUserService: ApUserService,
        private readonly configService: ConfigService
    ) {}

    /**
     * Get the ActivityPub actor object for a user. This object
     * contains the user's profile info (name, bio, etc.), as well
     * as URIs pointing to inbox, outbox, and other collections.
     * Note that, although we store info for "foreign" users, the
     * API only allows access to those who have accounts on this
     * server.
     *
     * @param name The name of a user on this server
     * @returns An actor object for the user
     * @memberof ApUserController
     */
    @Get('/:name')
    async getUserActor(@Param('name') name: string): Promise<UserActor> {
        return this.apUserService.getActorForUser(name);
    }

    /**
     * Get the inbox for a user. Inboxes are collections containing
     * all received objects. As Themis doesn't have private messages
     * (yet), these tend to be server status messages such as
     * acceptance of friend requests. Later on, that may change.
     *
     * @param name The name of a user on this server
     * @param page The page of the collection, if necessary
     * @returns The inbox collection, or the requested page from it
     * @memberof ApUserController
     */
    @Get('/:name/inbox')
    async getInbox(@Param('name') name: string, @Query('page') page: number): Promise<Collection> {
        return this.apUserService.getInbox(name, page);
    }

    /**
     * Post a message to a user's inbox. This is how other actors
     * (groups or users) deliver messages, but it's handled autmoatically.
     * Thus, this can be considered a private endpoint, although most
     * servers will need to access it. (Clients shouldn't have to.)
     *
     * @param name The name of a user on this server
     * @param body An ActivityPub activity object
     * @returns The result of handling the incoming message (this is
     * deliberately left vague)
     * @memberof ApUserController
     */
    @UseGuards(FederationGuard)
    @HttpPost('/:name/inbox')
    async postToInbox(@Param('name') name: string, @Body() body): Promise<any> {
        return this.apUserService.handleIncoming(name, body);
    }

    /**
     * Get a user's outbox. Under normal circumstances, onlt the user
     * should be allowed to do this. (TODO: We need to add the right
     * guards to ensure this.) An outbox is a collection, in AP terms.
     *
     * @param name The name of a user on this server
     * @param page The page of the collection, if necessary
     * @returns The outbox collection, or the requested page from it
     * @memberof ApUserController
     */
    @Get('/:name/outbox')
    async getOutbox(@Param('name') name: string, @Query('page') page: number): Promise<Collection> {
            return this.apUserService.getOutbox(name, page);
    }

    /**
     * Post a message to a user's outbox. Only the user should be
     * allowed to do this, whether from the Themis frontend or another
     * ActivityPub client.
     *
     * @param name The name of a user on this server
     * @param body An ActivityPub activity object, or a bare object (as per spec)
     * @param headers The headers of the request (these aren't used right now)
     * @returns The result of accepting the message (this is deliberately
     * left vague)
     * @memberof ApUserController
     */
    @HttpPost('/:name/outbox')
    @HttpCode(201)
    @UseGuards(ContentTypeGuard, AuthGuard("jwt"))
    @UseInterceptors(new LocationInterceptor)
    async postToOutbox(@Param('name') name: string, @Body() body, @Headers() headers): Promise<any> {
        return this.apUserService.acceptPostRequest(name, body);
    }

    /**
     * Get a user's followers list. This is a collection of
     * everyone who has sent the user an accepted Follow message.
     *
     * @param name The name of a user on this server
     * @returns The user's followers collection
     * @memberof ApUserController
     */
    @Get('/:name/followers')
    async getFollowers(@Param('name') name: string): Promise<Collection> {
        return this.apUserService.getFollowers(name);
    }

    /**
     * Get a user's following list. This is a collection of
     * everyone the user has sent an accepted Follow message to.
     *
     * @param name The name of a user on this server
     * @returns The user's following collection
     * @memberof ApUserController
     */
    @Get('/:name/following')
    async getFollowing(@Param('name') name: string): Promise<Collection> {
        return this.apUserService.getFollowing(name);
    }

    /**
     * Get a user's likes list. This is a collection of all
     * posts that the user has "liked" (which is tracked by
     * ActivityPub Like activities).
     *
     * @param name The name of a user on this server
     * @returns The user's likes collection
     * @memberof ApUserController
     */
    @Get('/:name/likes')
    async getLikes(@Param('name') name: string): Promise<Collection> {
        return this.apUserService.getLikes(name);
    }
}
