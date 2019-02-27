import { Injectable, NotImplementedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Activity } from '../definitions/activities/activity.entity';
import { GroupService } from '../../group/group.service';
import { Repository } from 'typeorm';
import { UserService } from '../../user/user.service';
import { PostService } from '../../post/post.service';
import { ConfigService } from '../../config/config.service';
import { Post } from '../../post/post.entity';
import { CreateActivity } from '../definitions/activities/create-activity';
import { fromUri, ActorType, Actor } from '../definitions/actor.interface';
import { CreateGlobalPostDto } from '../../post/create-global-post.dto';
import { PostObject } from '../definitions/activities/post-object';
import { AP } from '../definitions/constants';
import { TombstoneObject } from '../definitions/activities/tombstone-object';
import { ApGroupService } from '../ap-group/ap-group.service';
import { ApUserService } from '../ap-user/ap-user.service';
import { User } from 'src/user/user.entity';
import { UserActor } from '../definitions/actors/user.actor';

@Injectable()
export class ActivityService {
    constructor(
        @InjectRepository(Activity)
        private readonly activityRepository: Repository<Activity>,
        private readonly groupService: GroupService,
        private readonly userService: UserService,
        private readonly postService: PostService,
        private readonly configService: ConfigService,
        private readonly apGroupService: ApGroupService,
        private readonly apUserService: ApUserService
    ) {}

    async createPostFromActivity(activity: CreateActivity): Promise<Post> {
        const postObject = activity.object;
        const actor = this.getActorUri(activity.object.attributedTo);

        const { name, server } = fromUri(actor).actor;
        const groups = this.parseActor(activity.to, ActorType.Group);

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
     * Creat an ActivityPub object from a post in the database.
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
                attributedTo: post.sender.uri || this.apUserService.idForUser(post.sender),
                summary: post.subject,
                content: post.content,

                to: post.groups.map((g) => g.uri || this.apGroupService.idForGroup(g)),
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
     * Create a new "global" post, one that can come from any server.
     *
     * @param activity An activity representing the post
     * @returns A data object suitable for inserting into the DB
     * @memberof ActivityService
     */
    createNewGlobalPost(activity: CreateActivity): CreateGlobalPostDto {
        const post = activity.object;
        const { actor, type: senderType } = fromUri(this.getActorUri(post.attributedTo));

        return {
            sender: actor,
            subject: post.summary,
            content: post.content,
            groups: this.parseActor(activity.to, ActorType.Group),
            parent: post.inReplyTo || undefined,
            source: post.source || undefined,
            recipients: this.parseActor(activity.to, ActorType.User)
        }
    }

    /**
     * Create a new Create activity from a bare object,
     * as per ActivityPub spec 6.2.1. We won't add the ID here,
     * since that requires actually committing the post to the DB.
     *
     * @param asObject An object representing a post
     * @returns A new Create activity that wraps the object
     * @memberof ActivityService
     */
    activityFromObject(asObject: PostObject, sender?: User): CreateActivity {
        const from: string = asObject.attributedTo || (sender && sender.uri);

        const created: CreateActivity = {
            '@context': AP.Context,
            type: 'Create',
            actor: from,
            to: asObject.to || [],
            cc: asObject.cc || [],
            bto: asObject.bto || [],
            bcc: asObject.bcc || [],
            audience: asObject.audience || [],
            published: asObject.published,

            id: '',

            object: asObject
        };

        return created;
    }

    /**
     * Parse a list of actor URIs into objects
     *
     * @param targets An array of URIs representing actors
     * @param desiredType The type of actor: group or user
     * @returns Actor objects for every actor of the given type in the list
     * @memberof ActivityService
     */
    parseActor(targets: string[], desiredType: ActorType): Actor[] {
        return targets.map((t) => {
            const parsed = fromUri(t);
            return (parsed.type === desiredType) ? parsed.actor : undefined
        }).filter((e) => e != undefined);
    }

    /**
     * Extract a URI from an actor reference. These can be in
     * various forms (URI, array, or object), so we have to
     * compensate for that.
     *
     * @param actor A reference to an actor
     * @returns The URI for that actor
     * @memberof ActivityService
     */
    getActorUri(actor: string | (string | object)[]): string {
        // TODO: Better handling fo this
        if (typeof actor == 'string') {
            return actor;
        } else if (typeof actor[0] == 'string') {
            return actor[0] as string;
        } else {
            return actor[0]['id'];
        }
    }
}
