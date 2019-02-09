import { Controller, Get, Param, Delete, NotImplementedException, Body } from '@nestjs/common';
import { Post  as HttpPost } from '@nestjs/common';
import { PostService } from './post.service';
import { Post } from './post.entity';
import { CreatePostDto } from './create-post.dto';
import { CreateTopLevelPostDto } from './create-top-level-post.dto';
import { CreateReplyDto } from './create-reply.dto';

@Controller('internal/posts')
export class PostController {
    constructor(private readonly postService: PostService) {}

    @Get()
    async findAll(): Promise<Post[]> {
        return this.postService.findAll();
    }

    @Get('/get/:uuid')
    async findByUuid(@Param('uuid') uuid: string): Promise<Post> {
        const response = await this.postService.findByUuid(uuid);

        return response;
    }

    @Get('/by-group/:group')
    async findByGroup(@Param('group') group: string): Promise<Post[]> {
        // const response = await this.postService.findByGroup(group);
        const response = await this.postService.findTopLevelByGroup(group);
        
        return response;
    }

    @Get('/all-by-user/:id')
    async findAllByUser(@Param('id') id: number): Promise<Post[]> {
        const response = await this.postService.findByUserId(id);

        return response;
    }

    @Get('/all-in-group/:id')
    async findAllInGroup(@Param('id') id: number): Promise<Post[]> {
        const response = await this.postService.findByGroupId(id);

        return response;
    }

    // This method returns the children of a post as a property
    // of that post object, not as a separate collection.
    @Get('/get-children/:uuid')
    async findChildren(@Param('uuid') parent: string): Promise<Post> {
        const entity = await this.postService.findByUuid(parent);
        const response = await this.postService.findChildren(entity);

        return response;
    }

    // Note that we had to rename the NestJS "Post" decorator here.
    // That's one problem with making something that uses, well, posts.
    @HttpPost()
    async create(post: CreatePostDto): Promise<Post> {
        return await this.postService.create(post);
    }

    // Create a top-level post.
    @HttpPost('/new-thread')
    async createTopLevel(@Body() post: CreateTopLevelPostDto): Promise<Post> {
        return this.postService.createTopLevel(post);
    }

    // Reply to an existing post.
    // TODO: Figure out the type for the object
    @HttpPost('/reply-to/:uuid')
    async replyTo(@Body() post: CreateReplyDto, @Param('uuid') parent: string): Promise<Post> {
        try {
            return this.postService.createReply(post, parent);
        } catch (error) {
            throw error;
        }
    }

    @Delete('/get/:uuid')
    async delete(@Param('uuid') uuid: string): Promise<Post> {
        return await this.postService.delete(uuid);
    }
}
