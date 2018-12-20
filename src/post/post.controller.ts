import { Controller, Get, Param, Delete } from '@nestjs/common';
import { Post  as HttpPost } from '@nestjs/common';
import { PostService } from './post.service';
import { Post } from './post.entity';
import { CreatePostDto } from './create-post.dto';
import { async } from 'rxjs/internal/scheduler/async';

@Controller('internal/posts')
export class PostController {
    constructor(private readonly postService: PostService) {}

    @Get()
    async findAll(): Promise<Post[]> {
        return this.postService.findAll();
    }

    @Get('/get/:uuid')
    async findByUuid(@Param('uuid') uuid: string) {
        const response = await this.postService.findByUuid(uuid);

        return response;
    }

    @Get('/by-group/:group')
    async findByGroup(@Param('group') group: string) {
        const response = await this.postService.findByGroup(group);

        return response;
    }

    // Note that we had to rename the NestJS "Post" decorator here.
    // That's one problem with making something that uses, well, posts.
    @HttpPost()
    async create(post: CreatePostDto) {
        return await this.postService.create(post);
    }

    @Delete('/get/:uuid')
    async delete(@Param('uuid') uuid: string) {
        return await this.postService.delete(uuid);
    }
}
