import { Injectable } from '@nestjs/common';
import { PostService } from '../../post/post.service';
import { ConfigService } from '../../config/config.service';
import { Post } from '../../post/post.entity';

@Injectable()
export class ApPostService {
    constructor(
        private readonly postService: PostService,
        private readonly configService: ConfigService
    ) {}

    async getPostByUuid(uuid: string): Promise<Post> {
        const post = await this.postService.findByUuid(uuid);

        return post;
    }

    async getPostById(id: number): Promise<Post> {
        const post = await this.postService.find(id);

        return post;
    }
}
