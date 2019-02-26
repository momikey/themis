import { Controller, Get, Param, NotFoundException, Res, HttpStatus, GoneException } from '@nestjs/common';
import { ApPostService } from './ap-post.service';

@Controller('post')
export class ApPostController {
    constructor(
        private readonly apPostService: ApPostService,
    ) {}

    @Get('/:uuid')
    async getPostByUuid(@Param('uuid') uuid: string) {
        const result = await (async () => {
            try {
                const r = await this.apPostService.getPostByUuid(uuid);
                return r;
            } catch (e) {
                throw new NotFoundException(e);
            }
        })();

        if (result.deleted) {
            throw new GoneException(result);
        } else {
            return result;
        }
    }

    @Get('/id/:id')
    async getPostById(@Param('id') id: number) {
        const result = await (async () => {
            try {
                const r = await this.apPostService.getPostById(id);
                return r;
            } catch (e) {
                throw new NotFoundException(e);
            }
        })();

        if (result.deleted) {
            throw new GoneException(result);
        } else {
            return result;
        }
    }
}
