import { Controller, Get, Param, Delete } from '@nestjs/common';
import { Post  as HttpPost } from '@nestjs/common';
import { PostService } from './post.service';
import { Post } from './post.entity';
import { CreatePostDto } from './create-post.dto';

@Controller('internal/posts')
export class PostController {
    constructor(private readonly postService: PostService) {}

    @Get()
    async findAll(): Promise<Post[]> {
        return this.postService.findAll();
    }

    @Get('/:uuid')
    async findByUuid(@Param('uuid') uuid: string) {
        const response = this.postService.findbyUuid(uuid);

        return response;
    }

    // Note that we had to rename the NestJS "Post" decorator here.
    // That's one problem with making something that uses, well, posts.
    @HttpPost()
    async create(post: CreatePostDto) {
        return await this.postService.create(post);
    }

    @Delete('/:uuid')
    async delete(@Param('uuid') uuid: string) {
        return await this.postService.delete(uuid);
    }
}
