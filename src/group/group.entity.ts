import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Group {
    @PrimaryGeneratedColumn()
    id: number;

    // `name` is the canonical name for the group.
    // It's required, and it is local to the server.
    // TODO: What is a good length for this. We don't want it to be too long,
    // since it's used to generate @-names. We'll start with 60 for now.
    @Column('varchar', { length: 60 })
    name: string;

    // `server` is the name of the server hosting this group.
    // Groups are local to the server; IOW, multiple servers can all
    // have a group named "foo", and these would be separate.
    @Column('text')
    server: string;

    // `displayName` is a public name for the group.
    // It's not entirely necessary, but it's a useful parallel to users.
    @Column('text', { nullable: true })
    displayName: string;

    // `summary` is a brief description of the group's purpose.
    // This is mostly to match users, but it could also be useful to list
    // things like allowed topics, moderation (if we add that), etc.
    @Column('text', { nullable: true })
    summary: string;

    // We'll also store the date the group was created.
    // This isn't as necessary as for users, but it might come in handy.
    @CreateDateColumn({readonly: true })
    date: string;
}