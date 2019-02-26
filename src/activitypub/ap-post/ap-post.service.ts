import { Injectable } from '@nestjs/common';
import { PostService } from '../../post/post.service';
import { ConfigService } from '../../config/config.service';
import { Post } from '../../post/post.entity';
import { TombstoneObject } from '../definitions/activities/tombstone-object';
import { PostObject } from '../definitions/activities/post-object';
import { ActivityService } from '../activity/activity.service';
import * as URI from 'uri-js';

@Injectable()
export class ApPostService {
    constructor(
        private readonly postService: PostService,
        private readonly configService: ConfigService,
        private readonly activityService: ActivityService
    ) {}

    async getPostByUuid(uuid: string): Promise<PostObject | TombstoneObject> {
        const post = await this.postService.findByUuid(uuid);

        return this.getLocalPostObject(post);
    }

    async getPostById(id: number): Promise<PostObject | TombstoneObject> {
        const post = await this.postService.find(id);

        return this.getLocalPostObject(post);
    }

    getLocalPostObject(post: Post): Promise<PostObject | TombstoneObject> {
        if (post == null) {
            return Promise.reject("Post does not exist");
        }
        
        const uri = URI.parse(post.uri);

        if (uri.host == this.configService.serverAddress &&
            uri.port == this.configService.serverPort) {
                
            return Promise.resolve(this.activityService.createObjectFromPost(post));
        } else {
            // We don't return objects for posts that don't
            // originate on this server.
            // TODO: Maybe a better error message?
            return Promise.reject("Post not available");
        }
    }
}
