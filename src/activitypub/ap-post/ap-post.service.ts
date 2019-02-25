import { Injectable } from '@nestjs/common';
import { PostService } from '../../post/post.service';
import { ConfigService } from '../../config/config.service';
import { Post } from '../../post/post.entity';
import { TombstoneObject } from '../definitions/activities/tombstone-object';
import { PostObject } from '../definitions/activities/post-object';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class ApPostService {
    constructor(
        private readonly postService: PostService,
        private readonly configService: ConfigService,
        private readonly activityService: ActivityService
    ) {}

    async getPostByUuid(uuid: string): Promise<PostObject | TombstoneObject> {
        const post = await this.postService.findByUuid(uuid);

        return this.activityService.createObjectFromPost(post);
    }

    async getPostById(id: number): Promise<PostObject | TombstoneObject> {
        const post = await this.postService.find(id);

        return this.activityService.createObjectFromPost(post);
    }
}
