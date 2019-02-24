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
@Entity('activity')
export class Activity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => User, user => user.activities)
    targetUser: User;

    @ManyToOne(type => Group, group => group.activities)
    targetGroup: Group;

    @ManyToOne(type =>Post, post => post.activities)
    targetPost: Post;

    @Column()
    uuid: string;

    @CreateDateColumn()
    created: Date;
}