import { Controller, Get, Param, NotImplementedException, Body, Post as HttpPost } from '@nestjs/common';
import { ApUserService } from './ap-user.service';

@Controller('ap-user')
export class ApUserController {
    constructor(
        private readonly apUserService: ApUserService
    ) {}

    @Get('/:name/inbox')
    async getInbox(@Param('name') name: string) {
        throw new NotImplementedException();        
    }

    @HttpPost('/:name/inbox')
    async postToInbox(@Param('name') name: string, @Body() body) {
        throw new NotImplementedException();
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
