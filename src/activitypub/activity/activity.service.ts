import { Injectable, NotImplementedException, HttpService, HttpException, ImATeapotException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Activity } from '../../entities/activity.entity';
import { Repository, InsertResult } from 'typeorm';
import { PostService } from '../../post/post.service';
import { Post } from '../../entities/post.entity';
import { CreateActivity } from '../definitions/activities/create-activity';
import { fromUri, ActorType, parseActor, getActorUri, getIdForActor, Actor } from '../definitions/actor.interface';
import { PostObject } from '../definitions/activities/post-object';
import { AP } from '../definitions/constants';
import { TombstoneObject } from '../definitions/activities/tombstone-object';
import * as URI from 'uri-js';
import { ConfigService } from '../../config/config.service';
import { Collection, CollectionPage } from '../definitions/activities/collection-object';
import { compareDesc } from 'date-fns';
import { User } from '../../entities/user.entity';
import { GroupService } from '../../group/group.service';
import { UserService } from '../../user/user.service';
import { ServerService } from '../../server/server.service';
import { AcceptActivity } from '../definitions/activities/accept-activity';
import { Group } from '../../entities/group.entity';
import { AxiosResponse } from 'axios';

@Injectable()
export class ActivityService {
    constructor(
        @InjectRepository(Activity)
        private readonly activityRepository: Repository<Activity>,
        private readonly groupService: GroupService,
        private readonly userService: UserService,
        private readonly postService: PostService,
        private readonly configService: ConfigService,
        private readonly serverService: ServerService,
        private readonly httpService: HttpService
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

    createAcceptActivity(actor: string, object: string, target: string): AcceptActivity {
        const accept: AcceptActivity = {
            '@context': AP.Context,
            type: 'Accept',
            actor,
            object,
            target
        }

        return accept;
    }

    /**
     * Find an activity by its database ID. Used for retrieving by URI.
     *
     * @param id
     * @returns
     * @memberof ActivityService
     */
    async findById(id: number): Promise<Activity> {
        return this.activityRepository.findOne({id});
    }

    /**
     * Save an activity to the database. The activity can be
     * associated with one or more groups, users, or posts.
     * It will be given an ID and timestamp if those aren't
     * present.
     *
     * @param activity An object implementing at least some of the Activity interface
     * @returns The fully created Activity object, as stored in the DB
     * @memberof ActivityService
     */
    async save(activity: Partial<Activity>): Promise<Activity> {
        const entity = this.activityRepository.create(activity);

        // A new activity won't have the proper ID property set.
        // Since it's derived from the database ID, that means we
        // have to put it *into* the database first. Then, we'll
        // add the ID and update the entry before returning it.
        const inserted = await this.activityRepository.save(entity);

        if (typeof inserted.activityObject['object'] == 'string') {
            // Some activities allow their target objects to be specified
            // by URI instead of being embedded. For those, we can just
            // leave the URI as-is.
        } else if (inserted.activityObject['object'] && !inserted.activityObject['object'].id) {
            inserted.activityObject['object'].id = inserted.targetPost.uri;
        }

        if (!inserted.activityObject['id']) {
            if (!inserted.uri) {
                inserted.uri = this.getIdForActivity(inserted);
            }

            inserted.activityObject['id'] = inserted.uri;
            const updated = await this.activityRepository.update(inserted.id, 
                {
                    uri: inserted.uri,
                    activityObject: inserted.activityObject
                });
        }

        return inserted;
    }

    async deliverTo(activity: Activity, targets: Array<string>): Promise<AxiosResponse<any>[]> {
        const activityObject = activity.activityObject;

        const results = targets.map(async (t) => {
            if (t === AP.Public) {
                // Public address doesn't need to be delivered
                return Promise.resolve(undefined);
            } else {
                const uri = URI.parse(t);
                const server = await this.serverService.find({
                    host: uri.host,
                    scheme: uri.scheme,
                    port: +uri.port
                });
                const path = uri.path.split('/');

                if (this.serverService.isLocal(server)) {
                    const entity = (path[1] === 'group')
                    ? await this.groupService.findLocalByName(path[2])
                    : await this.userService.findLocalByName(path[2]);

                    return (this.httpService.post(
                        entity.actor.inbox,
                        activityObject
                    )).toPromise();
                } else {
                    // Federated
                    // TODO: Implement this
                    throw new NotImplementedException();
                }
            }
        });

        return Promise.all(results);
    }

    async deliver(activity: Activity): Promise<object> {
        const activityObject = activity.activityObject;        

        // We use a set for deduplication purposes.
        const targets = new Set<string>();
        
        // Targets can be in any of these properties.
        for (const prop of ['to', 'cc', 'bto', 'bcc', 'audience']) {
            const ap = activityObject[prop];
            if (ap) {
                if (typeof ap == 'string') {
                    targets.add(ap);
                } else if (ap instanceof Array) {
                    ap.forEach((e) => targets.add(e));
                }
            }
        }

        // Deliver to each target in the set.
        const deliveries = Array.from(targets).map(async (target) => {
            if (target === AP.Public) {
                /* TODO: Handle public addressing */
            } else if (target.includes('followers')) {
                /* TODO: Deliver to a collection of followers */
                return Promise.resolve(true);
            }else {
                const {actor, type} = fromUri(target);

                if (type === ActorType.Group) {
                    // Target is a group
                    const group = await this.groupService.findGlobalByName(actor.name, target);
                    
                    if (activity.destinationGroups && activity.destinationGroups.includes(group)) {
                        // Already processed this group
                        return Promise.resolve(true);
                    }
                    
                    if (this.serverService.isLocal(group.server)) {
                        // Local target for delivery

                        return (this.httpService.post(
                            group.actor.inbox,
                            activityObject
                        ).toPromise());
                    } else {
                        // External server, so check for federation, etc.
                        // TODO: All this
                    }
                } else {
                    // Target is a user
                    // TODO: All this
                }
            }
        });

        try {
            await Promise.all(deliveries);
        } catch (e) {
            throw new HttpException(e.response.data.error, e.response.data.statusCode);
        }

        return activityObject;
    }

    async sendFollowRequest(activity: Activity, target: Actor): Promise<any> {
        return this.deliverTo(activity, [activity.activityObject['object']]);
    }

    /**
     * Get an Activity entity based on a URI.
     *
     * @param uri The URI of the desired activity
     * @returns The database entity for the activity
     * @memberof ActivityService
     */
    async findByUri(uri: string): Promise<Activity> {
        return this.activityRepository.findOne({ uri });
    }

    /**
     * Creates a new Activity entity, but does *not* add it
     * to the database.
     *
     * @param activity The AP activity object
     * @returns A new Activity DB entity, ready to be inserted
     * @memberof ActivityService
     */
    create(activity: any): Activity {
        const entity = {
            object: activity,
            type: activity.type,
        }

        return this.activityRepository.create(entity);
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
     * @param post The post whose activities are wanted
     * @returns An array containing all activities connected to the post
     * @memberof ActivityService
     */
    async getActivitiesForPost(post: Post): Promise<Activity[]> {
        return this.activityRepository.find({ targetPost: post });
    }

    /**
     * Returns a list of all known activities sent by this user.
     *
     * @param user The user whose activities are wanted
     * @returns An array containing all activities where the user is the sender
     * @memberof ActivityService
     */
    async getOutboxActivitiesForUser(user: User): Promise<Activity[]> {
        return this.activityRepository.find({ sourceUser: user });
    }

    async getInboxActivitiesForUser(user: User): Promise<Activity[]> {
        // return this.activityRepository.find({ destinationUsers: [user] });
        const result = this.activityRepository.createQueryBuilder("activity")
            .leftJoinAndSelect("activity.destinationUsers", "user")
            .where("user.id = :id", { id: user.id })
            .getMany();

        return result;
    }

    /**
     * Returns a list of all known activities sent by this group.
     *
     * @param group The group whose activities are wanted
     * @returns An array containing all activities where the group is the sender
     * @memberof ActivityService
     */
    async getOutboxActivitiesForGroup(group: Group): Promise<Activity[]> {
        return this.activityRepository.find({ sourceGroup: group });
    }

    /**
     * Returns a list of all known activities targeting this group.
     *
     * @param group The group whose activities are wanted
     * @returns An array containing all activities sent to this group
     * @memberof ActivityService
     */
    async getInboxActivitiesForGroup(group: Group): Promise<Activity[]> {
        // return this.activityRepository.find({ destinationGroups: [group] });
        const result = this.activityRepository.createQueryBuilder("activity")
            .leftJoinAndSelect("activity.destinationGroups", "groups")
            .where("groups.id = :id", { id: group.id })
            .getMany();

        return result;
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
                scheme: (this.configService.isHttps) ? 'https' : 'http',
                host: this.configService.serverAddress,
                port: this.configService.serverPort,
                path: path
            }));
        }
    }

    /**
     * Create a new AP Collection for an array of activities.
     *
     * @template Act The type of activity
     * @param activities An array of activities
     * @returns A Collection object
     * @memberof ActivityService
     */
    createCollection<Act>(activities: Act[]): Collection {
        return {
            '@context': AP.Context,
            type: 'Collection',
            totalItems: activities.length,
            items: activities
        }
    }

    /**
     * Create a new AP OrderedCollection for an array of activities.
     * Because we must order these in reverse chronological order,
     * we need a little more information, which we find in each
     * activity's `created` field.
     *
     * @template Act The type of Activity
     * @param activities An array of activities
     * @returns An OrderedCollection object
     * @memberof ActivityService
     */
    createOrderedCollection<Act extends Chronological>(activities: Act[]): Collection {
        return {
            '@context': AP.Context,
            type: 'OrderedCollection',
            totalItems: activities.length,
            orderedItems: activities.sort((a,b) => compareDesc(a.created, b.created))
        }
    }

    /**
     * Create a page in a collection that would otherwise be too long
     * to reasonably transfer. This requires a lot of setup, as seen
     * in the arguments list.
     *
     * @template Act The type of activity
     * @param activities An array of activities
     * @param baseUri The base URI of the collection
     * @param pageNumber The number for this page
     * @param pageLength The length of each page
     * @returns A CollectionPage object suitable for inserting into a Collection
     * @memberof ActivityService
     */
    createCollectionPage<Act>(
        activities: Act[],
        baseUri: string | URI.URIComponents,
        pageNumber: number,
        pageLength: number) : CollectionPage {
            if (pageNumber < 1 || (pageNumber - 1) * pageLength > activities.length) {
                throw new RangeError(`Index ${pageNumber} out of range`);
            }

            const uri = (typeof baseUri == 'string') ? URI.parse(baseUri) : baseUri;
            const uriString = (typeof baseUri == 'string') ? baseUri : URI.normalize(URI.serialize(baseUri));

            uri.query = this.pageQueryString(pageNumber);

            const startPos = (pageNumber - 1) * pageLength;
            const endPos = (startPos + pageLength < activities.length)
                ? startPos - pageLength
                : activities.length;

            const page: CollectionPage = {
                '@context': AP.Context,
                type: 'CollectionPage',
                partOf: uriString,
                id: URI.normalize(URI.serialize(uri)),
                items: activities.slice(startPos, endPos).map((a: any) => a.activityObject)
            }

            if (startPos !== 0) {
                uri.query = this.pageQueryString(pageNumber - 1);
                page.prev = URI.normalize(URI.serialize(uri));
            }

            if (endPos !== activities.length) {
                uri.query = this.pageQueryString(pageNumber + 1);
                page.next = URI.normalize(URI.serialize(uri))
            }

            return page;
    }

    createPagedCollection<Act>(
        activities: Act[],
        numberPerPage: number,
        baseUri: string | URI.URIComponents,
        page?: number): Collection {
            const uri = (typeof baseUri == 'string') ? baseUri : URI.normalize(URI.serialize(baseUri));

            const collection = Object.assign(new Collection, {
                '@context': AP.Context,
                type: 'Collection',
                totalItems: Math.min(activities.length, numberPerPage),
                id: uri,
                first: undefined,
                current: undefined
            });

            if (page === undefined || page === 1) {
                collection.first = this.createCollectionPage(activities, baseUri, 1, numberPerPage);
                delete collection.current;
            } else {
                delete collection.first;
                collection.current = this.createCollectionPage(activities, baseUri, page, numberPerPage);
            }

            return collection;
    }

    pageQueryString(page: number) : string {
        return `page=${page}`;
    }
}

/**
 * Helper interface for sorting ordered collections.
 *
 * @interface Chronological
 */
interface Chronological {
    created: Date;
}
