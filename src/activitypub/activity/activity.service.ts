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
                type: 'Tombstone'
            }

            if (deletingActivity && deletingActivity.activityObject['published']) {
                tombstone.deleted = deletingActivity.activityObject['published'];
            }

            return tombstone
        }
    }

    async getActivitiesForPost(post: Post): Promise<Activity[]> {
        return this.activityRepository.find({ targetPost: post });
    }

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

    parseActor(targets: string[], desiredType: ActorType): Actor[] {
        return targets.map((t) => {
            const parsed = fromUri(t);
            return (parsed.type === desiredType) ? parsed.actor : undefined
        }).filter((e) => e != undefined);
    }

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
