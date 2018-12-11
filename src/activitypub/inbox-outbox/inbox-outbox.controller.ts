import { Controller, Get, Param, NotImplementedException, Post, Body } from '@nestjs/common';

// Routing for ActivityPub inbox/outbox.
// This doesn't have much now, but it lays out how Themis will approach
// the core of the AP spec. Once we have more of the innards of the app
// completed, we can start worrying about how best to do this part.
// Also, we'll probably have an InboxOutboxService under this, the better
// to communicate with the database on the back end.

@Controller()
export class InboxOutboxController {
    @Get('group/:name/inbox')
    getFromGroupInbox(@Param('name') name: string) {
        throw new NotImplementedException();
    }

    // NOTE: We'll need a real type for the POST content. This should be
    // some sort of intersection of ActivityPub objects/activities, because
    // it's allowed for servers to send an object. (In that case, we're
    // suuposed to wrap it in a Create activity.) That'll probably go in 
    // the service.
    @Post('group/:name/inbox')
    postToGroupInbox(
        @Param('name') name: string,
        @Body() activityPubObject: object) {
        throw new NotImplementedException();
    }

    @Get('group/:name/outbox')
    getFromGroupOutbox(@Param('name') name: string) {
        throw new NotImplementedException();
    }

    // NOTE: See above
    @Post('group/:name/outbox')
    postToGroupOutbox(
        @Param('name') name: string,
        @Body() activityPubObject: object) {
        throw new NotImplementedException();
    }

    @Get('user/:name/inbox')
    getFromUserInbox(@Param('name') name: string) {
        throw new NotImplementedException();
    }

    // NOTE: See above
    @Post('user/:name/inbox')
    postToUserInbox(
        @Param('name') name: string,
        @Body() activityPubObject: object) {
        throw new NotImplementedException();
    }

    @Get('user/:name/outbox')
    getFromUserOutbox(@Param('name') name: string) {
        throw new NotImplementedException();
    }

    // NOTE: See above
    @Post('user/:name/inbox')
    postToUserOutbox(
        @Param('name') name: string,
        @Body() activityPubObject: object) {
        throw new NotImplementedException();
    }
}