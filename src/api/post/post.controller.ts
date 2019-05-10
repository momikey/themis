import { Controller, Get, Param } from '@nestjs/common';
import { PostService } from '../../post/post.service';
import { Post } from '../../entities/post.entity';

/**
 * This controller handles posting, retrieving posts, and
 * operations of that nature. As with other API endpoints
 * in this module, these methods work with the database
 * directly, rather than going through the ActivityPub layer.
 *
 * @export
 * @class PostController
 */
@Controller('api/v1/post')
export class PostController {
    constructor(
        private readonly postService: PostService
    ) {}

    /**
     * Get the post with a given database ID. This can be a
     * foreign post, as we store them locally.
     *
     * @param id The post's database ID
     * @returns The object for the post with that ID
     * @memberof PostController
     */
    @Get('get/:id')
    async getPost(@Param('id') id: number): Promise<Post> {
        return this.postService.find(id);
    }

    /**
     * Checks whether a given post has any children. This is
     * used for threading in the frontend. (Children of a post
     * are other posts which have this post as their parent.)
     *
     * @param id The database ID of a post
     * @returns A boolean indicating whether the post has children
     * @memberof PostController
     */
    @Get('has-children/:id')
    async hasChildren(@Param('id') id: number): Promise<boolean> {
        return (await this.postService.countChildren(id)) > 0;
    }

    /**
     * Get the children of a given post. This does not return
     * the parent post.
     *
     * @param id The database ID of a post
     * @returns An array containing DB objects for all that 
     * post's children
     * @memberof PostController
     */
    @Get('get-children/:id')
    async getChildren(@Param('id') id: number): Promise<Post[]> {
        return this.postService.findChildren(id);
    }

    /**
     * Get the children of a given post, and add them to the
     * `children` property of that post.
     *
     * @param id The database ID of a post
     * @returns The original post, but with that post's children
     * array copied to its `children` property
     * @memberof PostController
     */
    @Get('get-with-children/:id')
    async getWithChildren(@Param('id') id: number): Promise<Post> {
        const post = await this.postService.find(id);
        post.children = await this.getChildren(id);
        return post;
    }
}
