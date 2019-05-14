import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, Tree, TreeChildren, TreeParent, ManyToMany, JoinTable } from "typeorm";
import { User } from "./user.entity";
import { Group } from "./group.entity";
import { Activity } from "./activity.entity";
import { Server } from "./server.entity";

/**
 * A post in a Themis group. In theory, this can also be used
 * for other fediverse messages, but that's for much later.
 *
 * @export
 * @class Post
 */
@Entity()
@Tree('materialized-path')
export class Post {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Although we have an autoincrement primary key,
     * we'll still refer to posts by a UUID. This is for many reasons,
     * such as URI handling.
     *
     * @memberof Post
     */
    @Column('text', { unique: true })
    uuid: string;

    /**
     * `server` is the server where this post originated.
     * We will store "foreign" posts for multiple reasons. One, for caching purposes,
     * to ease network load. Two, because we'll need references to them.
     *
     * @memberof Post
     */
    @ManyToOne(type => Server, server => server.posts, { eager: true })
    server: Server;

    /**
     * `sender` is the user who sent this post.
     *
     * @memberof Post
     */
    @ManyToOne(type => User, user => user.posts, { eager: true })
    sender: User;

    /**
     * 'uri' is the URI of this post. For foreign posts, this should be delivered
     * by the sending server. For local posts, we can generate it on the fly.
     *
     * @memberof Post
     */
    @Column('text')
    uri: string;

    /**
     * `parentUri` is the URI of the post that is this post's direct parent.
     * Note that we do *not* use a DB relation here, because AP actually
     * needs the URI of the post, and that may be harder to retrieve.
     * We will use the DB relation (TypeORM's tree type) below, for ease of use.
     *
     * @memberof Post
     */
    @Column('text')
    parentUri: string;

    /**
     * `groups` is a list of the groups this post is directed to.
     * Themis allows cross-posting, so we can't simply store a single entry.
     *
     * @memberof Post
     */
    @ManyToMany(type => Group, groups => groups.posts, { eager: true })
    @JoinTable()
    groups: Group[];

    /**
     * `subject` is the post's subject.
     * Some AP implementations may use this as the text for a CW
     *
     * @memberof Post
     */
    @Column('text')
    subject: string;

    /**
     * `content` is the body content of the post.
     *
     * @memberof Post
     */
    @Column('text')
    content: string;

    /**
     * `source` holds the original Markdown source of the post,
     * or nothing if the post was originally sent as HTML.
     * (Other AP implementations might do that.)
     *
     * @memberof Post
     */
    @Column('text', { nullable: true })
    source: string;

    /**
     * `timestamp` holds an auto-generated timestamp for the post.
     * Note that, unlike Users and Groups, Posts don't use the DB to make this.
     *
     * @memberof Post
     */
    @Column('datetime')
    timestamp: string;

    /**
     * `attachments` holds references to all media items attached to this post
     * TODO: Add a media table, and link entries here
     *
     * @memberof Post
     */
     /* @OneToMany(type => Media, media => media.post)
      attachments: Media[];
      */

    /**
     * `deleted` is a simple flag to indicate if a post has been "soft" deleted.
     * Themis will use this to create an AP Tombstone or HTTP error 451.
     *
     * @memberof Post
     */
    @Column('boolean')
    deleted: boolean;

    /**
     * The children of this post.
     *
     * @memberof Post
     */
    @TreeChildren()
    children: Post[];

    /**
     * The parent of this post.
     * Remember that a post can have any number of children, but only one parent.
     *
     * @memberof Post
     */
    @TreeParent()
    parent: Post;

    /**
     * 'activities' is a list of all activities connected to this post.
     * These might be useful for AP threading, etc.
     *
     * @memberof Post
     */
    @OneToMany(type => Activity, activity => activity.targetPost)
    activities: Activity[];

    /**
     * All users that like this post.
     *
     * @memberof Post
     */
    @ManyToMany(type => User, user => user.liked)
    likes: User[];
}