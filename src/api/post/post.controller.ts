import { Controller, Get, Param } from '@nestjs/common';
import { PostService } from '../../post/post.service';
import { Post } from '../../entities/post.entity';

@Controller('api/v1/post')
export class PostController {
    constructor(
        private readonly postService: PostService
    ) {}

    @Get('get/:id')
    async getPost(@Param('id') id: number): Promise<Post> {
        return this.postService.find(id);
    }

    @Get('has-children/:id')
    async hasChildren(@Param('id') id: number): Promise<boolean> {
        return (await this.postService.countChildren(id)) > 0;
    }

    @Get('get-children/:id')
    async getChildren(@Param('id') id: number): Promise<Post[]> {
        return this.postService.findChildren(id);
    }

    @Get('get-with-children/:id')
    async getWithChildren(@Param('id') id: number): Promise<Post> {
        const post = await this.postService.find(id);
        post.children = await this.getChildren(id);
        return post;
    }
}
