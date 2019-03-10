import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany, OneToMany, ManyToOne } from 'typeorm';
import { Post } from '../post/post.entity';
import { Activity } from '../activitypub/definitions/activities/activity.entity';
import { Server } from '../server/server.entity';

// Note that we have to change the table name because "group" is a reserved word in SQL.
@Entity("groups")
export class Group {
    @PrimaryGeneratedColumn()
    id: number;

    // `name` is the canonical name for the group.
    // It's required, and it is local to the server.
    // TODO: What is a good length for this? We don't want it to be too long,
    // since it's used to generate @-names. We'll start with 60 for now.
    @Column('varchar', { length: 60 })
    name: string;

    // `server` is the name of the server hosting this group.
    // Groups are local to the server; IOW, multiple servers can all
    // have a group named "foo", and these would be separate.
    @ManyToOne(type => Server, server => server.groups, { eager: true })
    server: Server;

    // `displayName` is a public name for the group.
    // It's not entirely necessary, but it's a useful parallel to users.
    @Column('text', { nullable: true })
    displayName: string;

    // `summary` is a brief description of the group's purpose.
    // This is mostly to match users, but it could also be useful to list
    // things like allowed topics, moderation (if we add that), etc.
    @Column('text', { nullable: true })
    summary: string;

    // Collection of posts in this group. Mostly used for easier DB access.
    @ManyToMany(type => Post, post => post.groups)
    posts: Post[];

    // 'activities' is a list of all activities connected to this group.
    // We use it for inbox generation, etc.
    @OneToMany(type => Activity, activity => activity.targetGroup)
    activities: Activity[];

    // 'uri' is a unique identifying URI for this group, used in the
    // ActivityPub portion of Themis.
    @Column({ nullable: true })
    uri: string;
    
    // We'll also store the date the group was created.
    // This isn't as necessary as for users, but it might come in handy.
    @CreateDateColumn({readonly: true })
    date: string;
}