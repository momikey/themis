import { Controller, Get, Param } from '@nestjs/common';
import { ApPostService } from './ap-post.service';

@Controller('post')
export class ApPostController {
    constructor(
        private readonly apPostService: ApPostService,
    ) {}

    @Get('/:uuid')
    async getPostByUuid(@Param('uuid') uuid: string) {
        return this.apPostService.getPostByUuid(uuid);
    }

    @Get('/id/:id')
    async getPostById(@Param('id') id: number) {
        return this.apPostService.getPostById(id);
    }
}
