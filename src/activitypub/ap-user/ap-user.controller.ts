import { Controller, Get, Param, NotImplementedException, Body, Post as HttpPost, MethodNotAllowedException } from '@nestjs/common';
import { ApUserService } from './ap-user.service';
import { ConfigService } from '../../config/config.service';
import { UserActor } from '../definitions/actors/user.actor';

@Controller('user')
export class ApUserController {
    constructor(
        private readonly apUserService: ApUserService,
        private readonly configService: ConfigService
    ) {}

    @Get('/:name')
    async getUserActor(@Param('name') name: string): Promise<UserActor> {
        return this.apUserService.getActorForUser(name);
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

    @Get('/:name/following')
    async getFollowing(@Param('name') name: string) {
        
    }
}