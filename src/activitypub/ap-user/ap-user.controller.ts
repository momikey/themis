import { Controller, Get, Param, NotImplementedException, Body, Post as HttpPost, MethodNotAllowedException, HttpCode, UseInterceptors, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { ApUserService } from './ap-user.service';
import { ConfigService } from '../../config/config.service';
import { UserActor } from '../definitions/actors/user.actor';
import { LocationInterceptor } from '../location.interceptor';
import { ContentTypeGuard } from '../content-type.guard';

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
    async getOutbox(@Param('name') name: string, @Query('page') page: number) {
            return this.apUserService.getOutbox(name, page);
    }

    @HttpPost('/:name/outbox')
    @HttpCode(201)
    // @UseGuards(ContentTypeGuard) // TODO: Add in AuthGuard here, too
    @UseInterceptors(new LocationInterceptor)
    async postToOutbox(@Param('name') name: string, @Body() body) {
        return this.apUserService.acceptPostRequest(name, body);
    }

    @Get('/:name/followers')
    async getFollowers(@Param('name') name: string) {
        return this.apUserService.getFollowers(name);
    }

    @Get('/:name/following')
    async getFollowing(@Param('name') name: string) {
        return this.apUserService.getFollowing(name);
    }

    @Get('/:name/likes')
    async getLikes(@Param('name') name: string) {
        return this.apUserService.getLikes(name);
    }
}
