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

// User authentication service. It does what it says.
// This one's fairly important. It'll have to handle passwords, auth tokens,
// and whatever else we decide to throw in. But all that can come once we
// have some idea of what we're doing.

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

    // Get the authentication entry for a given user.
    // Note that we don't return the password or token fields.
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

    // Create a JWT for a given user. This is for API access, which we'll add soon.
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

    async validateUser(payload: JwtPayload): Promise<boolean> {
        const user = await this.userService.findByName(payload.username);
        
        if (user) {
            const auth = await this.authRepository.findOne({ user: user });

            return (auth && user.name === payload.username && auth.email === payload.email);
        } else {
            return false;
        }

    }

    async validateAccount(account: CreateAccountDto): Promise<boolean> {
        // TODO: Add validation logic
        const user = await this.userService.findByName(account.username)
        
        if (user) {
            // User already exists
            return false;
        }

        return true;
    }

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

    // Update the last logged-in datetime for a specific user.
    // We can use this for stats, e.g., NodeInfo.
    async updateLastLogin(auth: Account): Promise<Account> {
        auth.lastLoggedIn = new Date();
        this.authRepository.save(auth);
        return auth;
    }

    // Change a user's role. This can upgrade or downgrade, but we'll
    // leave it up to other layers to determine who is allowed to do this.
    async changeRole(auth: Account, newRole: UserRole): Promise<Account> {
        auth.role = newRole;
        this.authRepository.save(auth);
        return auth;
    }

    // Create a new account. Note that this is for authentication first.
    // We'll also have to create the user.
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


    async count(): Promise<number> {
        return this.authRepository.count();
    }

    async countActiveSince(date: Date): Promise<number> {
        // TypeORM has a bug regarding date comparison in SQLite DBs.
        // (typeorm/typeorm#2286)
        //
        // As a workaround, we pull in the login dates, then count them here.
        const auth = await this.authRepository.find({ select: ['lastLoggedIn'] });

        return auth.map((e) => isAfter(e.lastLoggedIn, date)).length;
    }
}
