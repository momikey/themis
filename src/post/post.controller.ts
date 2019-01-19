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
        // const response = await this.postService.findByGroup(group);
        const response = await this.postService.findTopLevelByGroup(group);
        
        return response;
    }

    @Get('/all-by-user/:id')
    async findAllByUser(@Param('id') id: number) {
        const response = await this.postService.findByUserId(id);

        return response;
    }

    @Get('/all-in-group/:id')
    async findAllInGroup(@Param('id') id: number) {
        const response = await this.postService.findByGroupId(id);

        return response;
    }

    @Get('/get-children/:uuid')
    async findChildren(@Param('uuid') parent: string) {
        const entity = await this.postService.findByUuid(parent);
        const response = await this.postService.findChildren(entity);

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
    async replyTo(@Body() post: any, @Param('uuid') parent: string) {
        try {
            return this.postService.createReply(post, parent);
        } catch (error) {
            throw error;
        }
    }

    @Delete('/get/:uuid')
    async delete(@Param('uuid') uuid: string) {
        return await this.postService.delete(uuid);
    }
}
