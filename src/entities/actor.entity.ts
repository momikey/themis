import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

/**
 * The ActorEntity contains the data for a group or user's
 * ActivityPub Actor object. This is mostly just a bunch
 * of URIs, since all the "core" info is stored with the
 * actor's record.
 *
 * @export
 * @class ActorEntity
 */
@Entity('actor')
export class ActorEntity {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * The base URI for this actor.
     *
     * @memberof ActorEntity
     */
    @Column()
    uri: string;

    /**
     * The URI of this actor's inbox.
     *
     * @memberof ActorEntity
     */
    @Column()
    inbox: string;

    /**
     * The URI of this actor's outbox.
     *
     * @memberof ActorEntity
     */
    @Column()
    outbox: string;

    /**
     * The URI for this actor's following list.
     *
     * @memberof ActorEntity
     */
    @Column({ nullable: true })
    following: string;

    /**
     * The URI for this actor's followers list.
     *
     * @memberof ActorEntity
     */
    @Column({ nullable: true })
    followers: string;

    /**
     * The URI for this actor's likes list.
     *
     * @memberof ActorEntity
     */
    @Column({ nullable: true })
    liked: string;

    /**
     * The actual Actor object for this actor.
     *
     * @memberof ActorEntity
     */
    @Column('simple-json')
    object: object;
}