import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, Tree, TreeChildren, TreeParent, ManyToMany, JoinTable } from "typeorm";
import { User } from "../user/user.entity";
import { Group } from "../group/group.entity";

@Entity()
@Tree('materialized-path')
export class Post {
    @PrimaryGeneratedColumn()
    id: number;

    // Although we have an autoincrement primary key,
    // we'll still refer to posts by a UUID. This is for many reasons,
    // but assume I know what I'm doing.
    @Column('text', { unique: true })
    uuid: string;

    // `origin` is the server where this post originated.
    // We will store "foreign" posts for multiple reasons. One, for caching purposes,
    // to ease network load. Two, because we'll need references to them.
    @Column('text')
    server: string;

    // `sender` is the user who sent this post.
    @ManyToOne(type => User, user => user.posts)
    sender: User;

    // 'uri' is the URI of this post. For foreign posts, this should be delivered
    // by the sending server. For local posts, we can generate it on the fly.
    @Column('text')
    uri: string;

    // `parentUri` is the URI of the post that is this post's direct parent.
    // Note that we do *not* use a DB relation here, because AP actually
    // needs the URI of the post, and that may be harder to retrieve.
    // We will use the DB relation (TypeORM's tree type) below, for ease of use.
    @Column('text')
    parentUri: string;

    // `groups` is a list of the groups this post is directed to.
    // Themis allows cross-posting, so we can't simply store a single entry.
    @ManyToMany(type => Group, groups => groups.posts)
    @JoinTable()
    groups: Group[];

    // `subject` is the post's subject.
    // Some AP implementations may use this as the text for a CW
    @Column('text')
    subject: string;

    // `content` is the body content of the post.
    @Column('text')
    content: string;

    // `source` holds the original Markdown source of the post,
    // or nothing if the post was originally sent as HTML.
    // (Other AP implementations might do that.)
    @Column('text', { nullable: true })
    source: string;

    // `timestamp` holds an auto-generated timestamp for the post.
    // Note that, unlike Users and Groups, Posts don't use the DB to make this.
    @Column('datetime')
    timestamp: string;

    // `attachments` holds references to all media items attached to this post
    // TODO: Add a media table, and link entries here
    // @OneToMany(type => Media, media => media.post)
    // attachments: Media[];

    // `deleted` is a simple flag to indicate if a post has been deleted.
    // Themis will use this to create an AP Tombstone or HTTP error 451.
    @Column('boolean')
    deleted: boolean;

    // These two columns set up our tree relation for posts.
    // Remember that a post can have any number of children, but only one parent.
    @TreeChildren()
    children: Post[];

    @TreeParent()
    parent: Post;
}