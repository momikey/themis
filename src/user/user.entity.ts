import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, OneToMany } from 'typeorm';
import { Post } from '../post/post.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    // `name` is the canonical name for the user.
    // Note: the length here is a starting suggestion.
    // Can/should we allow names of arbitrary length?
    @Column('varchar', { length: 32 })
    name: string;

    // `server` is the name of the server the user is on.
    // Mostly, this is for caching purposes.
    @Column('text')
    server: string;

    // `displayName` is the "preferred" name for the user.
    @Column('text', { nullable: true })
    displayName: string;

    // `summary` is used for profile information, such as a bio or whatever.
    @Column('text', { nullable: true })
    summary: string;

    // `icon` is meant to contain a link (URI) to an icon image.
    // This is analagous to forum avatars or Usenet X-Face.
    @Column('text', { nullable: true })
    icon: string;

    // `posts` holds a list of all posts this user has made.
    // It's really only used to make the Post relation work.
    @OneToMany(type => Post, post => post.sender)
    posts: Post[];

    // We store the date the user's record was created, mostly for debugging,
    // but also so we can do the "date joined" thing on profile pages.
    @CreateDateColumn({ readonly: true })
    date: string;
}