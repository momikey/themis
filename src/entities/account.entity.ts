import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, Column, ManyToMany, JoinTable } from "typeorm";
import { User } from "./user.entity";
import { UserRole } from "../user/user-authentication/user-authentication.role";
import { Group } from "./group.entity";
import { Post } from "./post.entity";

@Entity()
export class Account {
    // A given user is only going to have one authentication entry,
    // but we'll still use a generated ID.
    @PrimaryGeneratedColumn()
    id: number;

    // The user. We'll normally only use the "internal" name in DB access,
    // but TypeORM really would rather have us do it this way.
    @OneToOne(type => User)
    @JoinColumn()
    user: User;

    // The user's email address, as given during signup.
    // (Worry about all the GDPR stuff later...)
    @Column('text')
    email: string;

    // The user's password. Obviously, this needs to be salted, hashed,
    // and baked into a delicious meal. Or however that works.
    @Column('text')
    password: string;

    // A simple flag to indicate whether a user has requested a password reset.
    // We don't do anything with that just yet, but give it time.
    @Column('boolean')
    reset: boolean;

    // JWT bearer token. I'm not sure if we're supposed to store this,
    // but it makes sense. After all, we'll be storing it on the *user* side.
    @Column('text', {nullable: true})
    token: string;

    // User role, such as "guest", "user", or "admin". This is used in 
    // the front end and some API calls. (Note that we're storing this
    // as a number rather than an enum, to better provide cross-DB compat.)
    @Column('integer', {default: UserRole.Guest})
    role: UserRole;

    @Column({nullable: true})
    lastLoggedIn: Date;

    /**
     * A list of all users who are following this account.
     *
     * @memberof Account
     */
    @ManyToMany(type => User)
    @JoinTable()
    userFollowers: User[];

    /**
     * A list of all users this account is following.
     *
     * @memberof Account
     */
    @ManyToMany(type => User)
    @JoinTable()
    userFollowing: User[];

    /**
     * A list of all groups following this account.
     *
     * @memberof Account
     */
    @ManyToMany(type => Group)
    @JoinTable()
    groupFollowers: Group[];

    /**
     * A list of all groups this account is following.
     *
     * @memberof Account
     */
    @ManyToMany(type => Group)
    @JoinTable()
    groupFollowing: Group[];

    // TODO: Do we need a date field here? Might be useful for password expiration.
}