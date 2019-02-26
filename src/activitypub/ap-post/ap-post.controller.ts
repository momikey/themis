import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApPostService } from './ap-post.service';

@Controller('post')
export class ApPostController {
    constructor(
        private readonly apPostService: ApPostService,
    ) {}

    @Get('/:uuid')
    async getPostByUuid(@Param('uuid') uuid: string) {
        try {
            const result = this.apPostService.getPostByUuid(uuid);
            return result;
        } catch (e) {
            throw new NotFoundException(e);
        }
    }

    @Get('/id/:id')
    async getPostById(@Param('id') id: number) {
        try {
            const result = await this.apPostService.getPostById(id);
            return result;
        } catch (e) {
            throw new NotFoundException(e);
        }
    }
}
