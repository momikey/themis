import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Column, ManyToMany, JoinTable } from "typeorm";
import { User } from "./user.entity";
import { Group } from "./group.entity";
import { Post } from "./post.entity";

/**
 * ActivityPub needs a way to access Activity objects, so it's only
 * natural that the server stores them. We do that here.
 *
 * @export
 * @class Activity
 */
@Entity('activity')
export class Activity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => User, user => user.outbox, { eager: true })
    sourceUser: User;

    @ManyToOne(type => Group, group => group.outbox, { eager: true })
    sourceGroup: Group;

    @ManyToMany(type => User, user => user.inbox, { eager: true })
    @JoinTable()
    destinationUsers: User[];

    @ManyToMany(type => Group, group => group.inbox, { eager: true })
    @JoinTable()
    destinationGroups: Group[];

    @ManyToOne(type =>Post, post => post.activities, { eager: true })
    targetPost: Post;

    @Column()
    type: string;

    @Column({nullable: true})
    uri: string;

    @Column('simple-json')
    activityObject: object;

    @CreateDateColumn()
    created: Date;
}