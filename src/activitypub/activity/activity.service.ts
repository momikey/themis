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
import { CreateGlobalPostDto } from 'src/post/create-global-post.dto';

@Injectable()
export class ActivityService {
    constructor(
        @InjectRepository(Activity)
        private readonly activityRepository: Repository<Activity>,
        private readonly groupService: GroupService,
        private readonly userService: UserService,
        private readonly postService: PostService,
        private readonly configService: ConfigService
    ) {}

    async createPostFromActivity(activity: CreateActivity): Promise<Post> {
        const postObject = activity.object;
        const actor = this.getActorUri(activity.object.attributedTo);

        const { name, server } = fromUri(actor).actor;
        const groups = this.parseGroups(activity.to);

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

    createNewGlobalPost(activity: CreateActivity): CreateGlobalPostDto {
        const post = activity.object;
        const { actor, type: senderType } = fromUri(this.getActorUri(post.attributedTo));

        return {
            sender: actor,
            subject: post.summary,
            content: post.content,
            groups: this.parseGroups(activity.to),
            parent: post.inReplyTo || undefined,
            source: post.source || undefined
        }
    }

    parseGroups(targets: string[]): Actor[] {
        // return targets.map((t) => {
        //     const pathElements = URI.parse(t).path.split('/');;
        //     const isGroup = (pathElements[1] === 'group');
        //     return (isGroup) ? pathElements[pathElements.length - 1] : '';
        // }).filter((e) => e != '');
        return targets.map((t) => {
            const parsed = fromUri(t);
            return (parsed.type === ActorType.Group) ? parsed.actor : undefined
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
