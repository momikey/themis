import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, OneToMany, ManyToOne, ManyToMany, JoinTable, OneToOne, JoinColumn } from 'typeorm';
import { Post } from './post.entity';
import { Activity } from './activity.entity';
import { Server } from './server.entity';
import { Group } from './group.entity';
import { ActorEntity } from './actor.entity';

/**
 * This is the "public" part of a user, and it can represent
 * either a user on this server or one from elsewhere.
 *
 * @export
 * @class User
 */
@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * `name` is the canonical name for the user.
     * Note: the length here is a starting suggestion.
     * Can/should we allow names of arbitrary length?
     *
     * @memberof User
     */
    @Column('varchar', { length: 32 })
    name: string;

    /**
     * `server` is the name of the server the user is on.
     * Mostly, this is for caching purposes.
     *
     * @memberof User
     */
    @ManyToOne(type => Server, server => server.users, { eager: true })
    server: Server;

    /**
     * `displayName` is the "preferred" name for the user.
     *
     * @memberof User
     */
    @Column('text')
    displayName: string;

    /**
     * `summary` is used for profile information, such as a bio or whatever.
     *
     * @memberof User
     */
    @Column('text')
    summary: string;

    /**
     * `icon` is meant to contain a link (URI) to an icon image.
     * This is analagous to forum avatars or Usenet X-Face.
     *
     * @memberof User
     */
    @Column('text')
    icon: string;

    /**
     * `posts` holds a list of all posts this user has made.
     * It's really only used to make the Post relation work.
     *
     * @memberof User
     */
    @OneToMany(type => Post, post => post.sender)
    posts: Post[];

    /**
     * All the activities in this user's AP outbox.
     *
     * @memberof User
     */
    @OneToMany(type => Activity, activity => activity.sourceUser)
    outbox: Activity[];

    /**
     * All the activities in this user's AP inbox.
     *
     * @memberof User
     */
    @ManyToMany(type => Activity, activity => activity.destinationUsers)
    inbox: Activity[];

    /**
     * 'uri' is a unique identifying URI for this group, used in the
     * ActivityPub portion of Themis.
     *
     * @memberof User
     */
    @Column({ nullable: true })
    uri: string;
    
    /**
     * We store the date the user's record was created, mostly for debugging,
     * but also so we can do the "date joined" thing on profile pages.
     *
     * @memberof User
     */
    @CreateDateColumn({ readonly: true })
    date: string;

    /**
     * All posts that this user likes. We store this here instead of on
     * account so that we can turn around and use it on posts, too.
     *
     * @memberof User
     */
    @ManyToMany(type => Post, post => post.likes)
    @JoinTable()
    liked: Post[];

    /**
     * A list of all users who are following this account.
     *
     * @memberof User
     */
    @ManyToMany(type => User, user => user.userFollowing)
    @JoinTable()
    userFollowers: User[];

    /**
     * A list of all users this account is following.
     *
     * @memberof User
     */
    @ManyToMany(type => User, user => user.userFollowers)
    userFollowing: User[];

    /**
     * A list of all groups following this account.
     *
     * @memberof User
     */
    @ManyToMany(type => Group)
    @JoinTable()
    groupFollowers: Group[];

    /**
     * A list of all groups this account is following.
     *
     * @memberof User
     */
    @ManyToMany(type => Group, group => group.followingUsers)
    @JoinTable()
    groupFollowing: Group[];

    /**
     * The ActivityPub Actor object for this user.
     *
     * @memberof User
     */
    @OneToOne(type => ActorEntity, { cascade: true, eager: true })
    @JoinColumn()
    actor: ActorEntity;
}