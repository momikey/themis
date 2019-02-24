import { Controller, Get, NotImplementedException, Post as HttpPost, Body, Param, MethodNotAllowedException } from '@nestjs/common';
import { ApGroupService } from './ap-group.service';
import { Collection } from '../definitions/activities/collection-object';
import { AP } from '../definitions/constants';
import { ConfigService } from '../../config/config.service';
import { GroupActor } from '../definitions/actors/group.actor';

@Controller('group')
export class ApGroupController {
    constructor(
        private readonly apGroupService: ApGroupService,
        private readonly configService: ConfigService
    ) {}

    @Get('/:name')
    async getGroupActor(@Param('name') name: string): Promise<GroupActor> {
        return this.apGroupService.getActorForGroup(name);
    }

    @Get('/:name/inbox')
    async getInbox(@Param('name') name: string) {
        throw new NotImplementedException();        
    }

    @HttpPost('/:name/inbox')
    async postToInbox(@Param('name') name: string, @Body() body) {
        if (this.configService.isFederating) {
            throw new NotImplementedException();
        } else {
            throw new MethodNotAllowedException();
        }
    }

    @Get('/:name/outbox')
    async getOutbox(@Param('name') name: string) {
        throw new NotImplementedException();
    }

    @HttpPost('/:name/outbox')
    async postToOutbox(@Param('name') name: string, @Body() body) {
        throw new NotImplementedException();
    }

    @Get('/:name/followers')
    async getFollowers(@Param('name') name: string) {
        throw new NotImplementedException();
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
