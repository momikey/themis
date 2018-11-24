import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm";
import { User } from "../user/user.entity";

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number;

    // Although we have an autoincrement primary key,
    // we'll still refer to posts by a UUID. This is for many reasons,
    // but assume I know what I'm doing.
    @Column('text', { unique: true })
    uuid: string;

    // `origin` is the server where this post originated.
    // We can store "foreign" posts for caching purposes, to ease network load.
    @Column('text')
    server: string;

    // `sender` is the user who sent this post.
    @ManyToOne(type => User, user => user.posts)
    sender: User;

    // `parent` is the URI of the post that is this post's direct parent.
    // Note that we do *not* use a DB relation here, because AP actually
    // needs the URI of the post, and that may be harder to retrieve.
    @Column('text')
    parent: string;

    // `groups` is a list of the groups this post is directed to.
    // Themis allows cross-posting, so we can't simply store a single entry.
    @Column('simple-array')
    groups: string[];

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
}