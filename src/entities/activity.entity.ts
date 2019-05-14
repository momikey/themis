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

    /**
     * The user who sent the Activity, if any.
     *
     * @memberof Activity
     */
    @ManyToOne(type => User, user => user.outbox, { eager: true })
    sourceUser: User;

    /**
     * The group that sent the activity, if any.
     * Note that thi sis mutually exclusive with `sourceUser` above.
     *
     * @memberof Activity
     */
    @ManyToOne(type => Group, group => group.outbox, { eager: true })
    sourceGroup: Group;

    /**
     * The users who are to receive this activity.
     *
     * @memberof Activity
     */
    @ManyToMany(type => User, user => user.inbox, { eager: true })
    @JoinTable()
    destinationUsers: User[];

    /**
     * The groups that are to receive this activity. This is
     * only really valid for Create, Update, Follow, and Undo.
     * (Maybe others later on.)
     *
     * @memberof Activity
     */
    @ManyToMany(type => Group, group => group.inbox, { eager: true })
    @JoinTable()
    destinationGroups: Group[];

    /**
     * The post affected by this activity. For instance, a Create
     * would (obviously) create the post.  An Update updates it,
     * and so on.
     *
     * @memberof Activity
     */
    @ManyToOne(type =>Post, post => post.activities, { eager: true })
    targetPost: Post;

    /**
     * The type of the activity. We store that in the object itself,
     * but having it here makes things easier.
     *
     * @memberof Activity
     */
    @Column()
    type: string;

    @Column({nullable: true})
    uri: string;

    /**
     * The URI of the activity. These are globally unique, or else
     * they *should* be.
     *
     * @memberof Activity
     */
    @Column('simple-json')
    activityObject: object;

    @CreateDateColumn()
    created: Date;
}