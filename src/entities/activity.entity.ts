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

    @ManyToOne(type => User, user => user.activities, { eager: true })
    targetUser: User;

    @ManyToMany(type => Group, group => group.activities, { eager: true })
    @JoinTable()
    targetGroups: Group[];

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