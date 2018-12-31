import { Controller, Get, Param, Delete, NotImplementedException, Body } from '@nestjs/common';
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

    // Create a top-level post.
    // TODO: Figure out the type for the object
    @HttpPost('/new-thread')
    async createTopLevel(@Body() post: any) {
        return this.postService.createTopLevel(post);
    }

    // Reply to an existing post.
    // TODO: Figure out the type for the object
    @HttpPost('/reply-to/:uuid')
    async replyTo(@Param('uuid') uuid: string) {
        throw new NotImplementedException();
    }

    @Delete('/get/:uuid')
    async delete(@Param('uuid') uuid: string) {
        return await this.postService.delete(uuid);
    }
}
