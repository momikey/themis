import { Injectable } from '@nestjs/common';
import { PostService } from '../../post/post.service';
import { ConfigService } from '../../config/config.service';
import { Post } from '../../entities/post.entity';
import { TombstoneObject } from '../definitions/activities/tombstone-object';
import { PostObject } from '../definitions/activities/post-object';
import { ActivityService } from '../activity/activity.service';
import * as URI from 'uri-js';
import { CreateActivity } from '../definitions/activities/create-activity';
import { CreateGlobalPostDto } from 'src/dtos/create-global-post.dto';
import { fromUri, getActorUri, parseActor, ActorType } from '../definitions/actor.interface';
import { DeleteActivity } from '../definitions/activities/delete-activity';
import { UpdateActivity } from '../definitions/activities/update-activity';

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

    async getPostEntityByUri(uri: string): Promise<Post> {
        return this.postService.findByUri(uri);
    }

    getLocalPostObject(post: Post): Promise<PostObject | TombstoneObject> {
        if (post == null) {
            return Promise.reject("Post does not exist");
        }
        
        const uri = URI.parse(post.uri);

        if (uri.host == this.configService.serverAddress &&
            uri.port == this.configService.serverPort || uri.port == undefined) {
                
            return Promise.resolve(this.activityService.createObjectFromPost(post));
        } else {
            // We don't return objects for posts that don't
            // originate on this server.
            // TODO: Maybe a better error message?
            return Promise.reject("Post not available");
        }
    }

    /**
     * Create a new "global" post, one that can come from any server.
     *
     * @param activity An activity representing the post
     * @returns A data object suitable for inserting into the DB
     * @memberof ActivityService
     */
    createNewGlobalPost(activity: CreateActivity): CreateGlobalPostDto {
        const post = activity.object;
        const { actor, type: senderType } = fromUri(getActorUri(post.attributedTo));

        return {
            sender: actor,
            subject: post.summary,
            content: post.content,
            groups: parseActor(activity.to, ActorType.Group),
            parent: post.inReplyTo || undefined,
            source: post.source || undefined,
            recipients: parseActor(activity.to, ActorType.User)
        }
    }

    /**
     * Submits a post derived from an Activity. This can come from
     * any server.
     *
     * @param post The data for the post
     * @returns The post entity that will be inserted into the DB
     * @memberof ApPostService
     */
    async submitNewGlobalPost(post: CreateGlobalPostDto): Promise<Post> {
        return this.postService.createFromActivity(post);
    }

    /**
     * Delete a post derived from an Activity. This is a "soft" deletion,
     * meaning that the post remains in the database, but attempts to access
     * it will fail.
     *
     * @param activity The activity containing the post to be deleted
     * @returns The updated post entity
     * @memberof ApPostService
     */
    async deletePostFromActivity(activity: DeleteActivity): Promise<Post> {
        const postUri = (typeof activity.object == 'string')
            ? activity.object
            : activity.object['id'];
        
        const post = await this.postService.findByUri(postUri);
        return this.postService.softDelete(post);
    }

    /**
     * Update a post based on the data in an Activity. This is a
     * partial update, as per AP specs.
     *
     * @param activity The activity containing the updated post
     * @returns The updated post entity
     * @memberof ApPostService
     */
    async updatePostFromActivity(activity: UpdateActivity): Promise<Post> {
        const postUri = activity.object.id;
        const post = await this.postService.findByUri(postUri);

        for (const prop in activity.object) {
            if (activity.object[prop] === null) {
                // Properties set to `null` must be deleted.
                delete post[prop];
            } else if (prop === 'id') {
                // Don't touch the ID, because it's special.
                continue;
            } else {
                post[prop] = activity.object[prop];
            }
        }

        return this.postService.update(post);
    }
}
