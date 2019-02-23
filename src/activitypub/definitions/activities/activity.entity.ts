import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Column } from "typeorm";
import { User } from "../../../user/user.entity";
import { Group } from "../../../group/group.entity";
import { Post } from "../../../post/post.entity";

/**
 * ActivityPub needs a way to access Activity objects, so it's only
 * natural that the server stores them. We do that here.
 *
 * @export
 * @class Activity
 */
@Entity('activities')
export class Activity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => User, user => user.activities, { nullable: true })
    users: User[];

    @ManyToOne(type => Group, group => group.activities, { nullable: true })
    groups: User[];

    @ManyToOne(type =>Post, post => post.activities, { nullable: true })
    posts: Post[];

    @Column()
    uuid: string;

    @CreateDateColumn()
    created: Date;
}