import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user.service';
import { JwtPayload } from './jwt.interface';
import { User } from '../../entities/user.entity';
import { CreateAccountDto } from '../../dtos/create-account.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from '../../entities/account.entity';
import { Repository, useContainer } from 'typeorm';
import { ConfigService } from '../../config/config.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../../dtos/login.dto';
import { TokenDto } from '../../dtos/token.dto';
import { UserRole } from './user-authentication.role';
import { isAfter } from 'date-fns';
import { Group } from '../../entities/group.entity';
import { Post } from '../../entities/post.entity';

/**
 * User authentication service. It does what it says.
 * This one's fairly important. It'll have to handle passwords, auth tokens,
 * and whatever else we decide to throw in. But all that can come once we
 * have some idea of what we're doing.
 *
 * @export
 * @class UserAuthenticationService
 */
@Injectable()
export class UserAuthenticationService {
    constructor(
        @InjectRepository(Account)
        private readonly authRepository: Repository<Account>,
        private readonly userService: UserService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService
    ) {}

    // Number of salt rounds used for bcrypt
    saltRounds = 12;

    /**
     * Get the authentication entry for a given user.
     * Note that we don't return the password or token fields.
     *
     * @param name The username
     * @returns The auth entry for the user, excluding password and
     * any stored tokens
     * @memberof UserAuthenticationService
     */
    async findOne(name: string): Promise<Account> {
        const user = await this.userService.findByName(name);

        if (!user) {
            return Promise.reject(`User ${name} not found`);
        } else {        
            return this.authRepository.findOneOrFail({
                select: ['id', 'user', 'email', 'reset', 'role', 'lastLoggedIn'],
                where: {user},
            });
        }
    }

    /**
     * Create a JWT for a given user. All API access is done through this.
     *
     * @param user A JWT "payload" object containing the username and email
     * @returns A DTO containing the token and its expiration time
     * @memberof UserAuthenticationService
     */
    async createToken(user: JwtPayload): Promise<TokenDto> {
        // TODO: temp method
        // const user = await this.userService.findByName(username);
        const token: JwtPayload = {
            username: user.username,
            email: ''   // Not yet implemented
        }

        return {
            expiresIn: 3600,
            accessToken: this.jwtService.sign(token)
        }
    }

    /**
     * Create a login token. These are the primary means of API access
     * for Themis users. (We may implement OAuth or something later on.)
     *
     * @param login A DTO containing the username and password
     * @returns An object containing the token and its expiration time (default 1 day)
     * @memberof UserAuthenticationService
     */
    async createLoginToken(login: LoginDto): Promise<TokenDto> {
        const user = await this.userService.findByName(login.username);
        const auth = await this.authRepository.findOneOrFail({ user: user });

        const token: JwtPayload = {
            username: user.name,
            email: auth.email
        }

        return {
            expiresIn: 3600 * 24,
            accessToken: this.jwtService.sign(token)
        }
    }

    /**
     * Validate a user, checking that the data in the toekn they give
     * matches what we have in the database. Tokens are signed by the
     * server, so we assume they aren't forged. And they don't contain
     * the user's password.
     *
     * @param payload An object containnig the user's name and email
     * @returns Whether the given data matches that in the DB for this user
     * @memberof UserAuthenticationService
     */
    async validateUser(payload: JwtPayload): Promise<boolean> {
        const user = await this.userService.findByName(payload.username);
        
        if (user) {
            const auth = await this.authRepository.findOne({ user: user });

            return (auth && user.name === payload.username && auth.email === payload.email);
        } else {
            return false;
        }

    }

    /**
     * Validate a new account. At the moment, this only checks to see
     * if the username has been used. In the future, we'll add things
     * like spam blocking, password strength requirements, etc.
     *
     * @param account A DTO representing the new account
     * @returns Whether the account meets our criteria
     * @memberof UserAuthenticationService
     */
    async validateAccount(account: CreateAccountDto): Promise<boolean> {
        // TODO: Add validation logic
        const user = await this.userService.findByName(account.username)
        
        if (user) {
            // User already exists
            return false;
        }

        return true;
    }

    /**
     * Validate a login attempt. This checks two things: that the user
     * exists on our server, and that the given password is correct for
     * that user.
     * 
     * Note that we do return different errors in these two cases. From
     * a security standpoint, that's considered bad practice, but these
     * only go as far as the controller level; the end user only gets a
     * 403 Forbidden error.
     *
     * @param login A DTO containing the username and password
     * @returns The authentication entity for the user, if valid
     * @memberof UserAuthenticationService
     */
    async validateLogin(login: LoginDto): Promise<Account> {
        const user = await this.userService.findByName(login.username);

        if (user) {
            const auth = await this.authRepository.findOne({ user: user });

            if (auth) {
                const isPasswordCorrect =  await bcrypt.compare(login.password, auth.password);

                if (isPasswordCorrect) {
                    this.updateLastLogin(auth);
                    return auth;
                } else {
                    return Promise.reject('Incorrect password');
                }
            } else {
                return Promise.reject('User does not exist on this server');
            }
        } else {
            return Promise.reject('User does not exist on this server');
        }
    }

    /**
     * Update the last logged-in datetime for a specific user.
     * We can use this for stats, e.g., NodeInfo.
     *
     * @param auth The user's account DB entity
     * @returns The updated entity
     * @memberof UserAuthenticationService
     */
    async updateLastLogin(auth: Account): Promise<Account> {
        auth.lastLoggedIn = new Date();
        this.authRepository.save(auth);
        return auth;
    }

    /**
     * Change a user's role. This can upgrade or downgrade, but we'll
     * leave it up to other layers to determine who is allowed to do this.
     *
     * @param auth The user's account DB entity
     * @param newRole The new role to give the user
     * @returns The updated entity
     * @memberof UserAuthenticationService
     */
    async changeRole(auth: Account, newRole: UserRole): Promise<Account> {
        auth.role = newRole;
        this.authRepository.save(auth);
        return auth;
    }

    /**
     * Create a new account. Note that this is for authentication first.
     * We'll also have to create the user, but that's for another service.
     *
     * @param account A DTO containing the data for the new account
     * @param [role] The new role, as taken from the `UserRole` enum
     * @returns An object representing the new account in the DB
     * @memberof UserAuthenticationService
     */
    async createAccount(account: CreateAccountDto, role?: UserRole): Promise<Account> {
        if (await this.validateAccount(account)) {
            const newUser = await this.userService.createEmptyUserEntry(account.username);
            
            const result = bcrypt.hash(account.password, this.saltRounds)
                .then((hash) => {
                    const auth = this.authRepository.create({
                        user: newUser,
                        email: account.email,
                        reset: false,
                        password: hash,
                        role: role || UserRole.User
                    });

                    this.authRepository.save(auth);

                    return auth;
                });

            return result;
        } else {
            return Promise.reject('Could not create the account');
        }
    }

    /**
     * Get the role for a user on this server (admin, mod, etc.)
     *
     * @param username The user's name
     * @returns The role, as a value in the `UserRole` enum
     * @memberof UserAuthenticationService
     */
    async getUserRole(username: string): Promise<UserRole> {
        const user = await this.userService.findByName(username);
        const auth = await this.authRepository.findOne({
            relations: ['user'],
            where: { user }
        });

        if (auth) {
            return auth.role;
        } else {
            throw new Error('User does not exist');
        }
    }


    /**
     * Get the total number of registered users on this server,
     * for use in stats and the like.
     *
     * @returns The number of accounts in the database
     * @memberof UserAuthenticationService
     */
    async count(): Promise<number> {
        return this.authRepository.count();
    }

    /**
     * Get the number of registered users who last logged in
     * after a given date
     *
     * @param date The cutoff date
     * @returns The number of users who have logged in since the given date
     * @memberof UserAuthenticationService
     */
    async countActiveSince(date: Date): Promise<number> {
        // TypeORM has a bug regarding date comparison in SQLite DBs.
        // (typeorm/typeorm#2286)
        //
        // As a workaround, we pull in the login dates, then count them here.
        const auth = await this.authRepository.find({ select: ['lastLoggedIn'] });

        return auth.map((e) => isAfter(e.lastLoggedIn, date)).length;
    }
}
