import { Injectable, NotImplementedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Activity } from '../definitions/activities/activity.entity';
import { Repository } from 'typeorm';
import { PostService } from '../../post/post.service';
import { Post } from '../../post/post.entity';
import { CreateActivity } from '../definitions/activities/create-activity';
import { fromUri, ActorType, parseActor, getActorUri, getIdForActor } from '../definitions/actor.interface';
import { PostObject } from '../definitions/activities/post-object';
import { AP } from '../definitions/constants';
import { TombstoneObject } from '../definitions/activities/tombstone-object';
import * as URI from 'uri-js';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class ActivityService {
    constructor(
        @InjectRepository(Activity)
        private readonly activityRepository: Repository<Activity>,
        private readonly postService: PostService,
        private readonly configService: ConfigService
    ) {}

    async createPostFromActivity(activity: CreateActivity): Promise<Post> {
        const postObject = activity.object;
        const actor = getActorUri(activity.object.attributedTo);

        const { name, server } = fromUri(actor).actor;
        const groups = parseActor(activity.to, ActorType.Group);

        const post = {
            sender: name,
            server: server,
            subject: postObject.summary,
            parent: '',
            content: postObject.content,
            source: (postObject.source && postObject.source.content) || postObject.content,
            primaryGroup: groups[0],
            ccGroups: groups.slice(1),
        }

        if (postObject.inReplyTo) {
            // Post is a reply, so add parent
            post.parent = postObject.inReplyTo;
        }

        // return this.postService.createTopLevel(post);
        throw new NotImplementedException();
    }

    /**
     * Create an ActivityPub object from a post in the database.
     * This fills in all of the necessary properties, but it also
     * compacts the _to_ and _cc_ fields.
     *
     * @param post The post to convert
     * @returns A new ActivityPub object representing the post
     * @memberof ActivityService
     */
    async createObjectFromPost(post: Post): Promise<PostObject | TombstoneObject> {
        const activities = await this.getActivitiesForPost(post);

        if (!post.deleted) {
            const children = await this.postService.getReplies(post);
            const parent = await this.postService.getParent(post);

            const postObject: PostObject = {
                '@context': AP.Context,
                id: post.uri,
                type: 'Article',
                attributedTo: post.sender.uri || getIdForActor(post.sender, ActorType.User) /* this.apUserService.idForUser(post.sender) */,
                summary: post.subject,
                content: post.content,

                to: post.groups.map((g) => g.uri || getIdForActor(g, ActorType.Group)),
                created: post.timestamp
            }

            if (parent) {
                postObject.inReplyTo = post.parentUri || parent.uri;
            }

            if (post.source) {
                postObject.source = {
                    content: post.source,

                    // TODO: Configuration for type
                    mediaType: 'text/markdown'
                }
            }

            if (children) {
                postObject.replies = children.map((c) => c.uri);
            }

            return postObject;
        } else {
            // Create a Tombstone object to represent deleted posts
            // TODO: Store a deletion timestamp
            const deletingActivity = activities.find((a) => a.activityObject['type'] === 'Delete');

            const tombstone: TombstoneObject = {
                '@context': AP.Context,
                id: post.uri,
                type: 'Tombstone',
                deleted: ((deletingActivity && deletingActivity.created) || new Date(0)).toJSON(),
                reason: (deletingActivity && deletingActivity.activityObject['summary']) || 
                    'Unknown reason'
            }

            if (deletingActivity && deletingActivity.activityObject['published']) {
                tombstone.deleted = deletingActivity.activityObject['published'];
            }

            return tombstone;
        }
    }

    /**
     * Returns a list of all known activities that reference this post.
     *
     * @param post The post whose activities you want to get
     * @returns An array containing all activities connected to the post
     * @memberof ActivityService
     */
    async getActivitiesForPost(post: Post): Promise<Activity[]> {
        return this.activityRepository.find({ targetPost: post });
    }

    /**
     * Each activity also requires a unique ID, as per spec. This
     * method generates one based on the database ID.
     *
     * @param activity An entity representing the activity
     * @returns A unique URI for the activity
     * @memberof ActivityService
     */
    getIdForActivity(activity: Activity): string {
        if (activity.activityObject['id']) {
            return activity.activityObject['id'];
        } else {
            const path = `/p/${activity.id}`;
            return URI.normalize(URI.serialize({
                scheme: 'https',
                host: this.configService.serverAddress,
                port: this.configService.serverPort,
                path: path
            }));
        }
    }
}
