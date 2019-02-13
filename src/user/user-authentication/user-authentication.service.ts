import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user.service';
import { JwtPayload } from './jwt.interface';
import { User } from '../user.entity';
import { CreateAccountDto } from './create-account.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAuthentication } from './user-authentication.entity';
import { Repository, useContainer } from 'typeorm';
import { ConfigService } from '../../config/config.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './login.dto';
import { TokenDto } from './token.dto';
import { UserRole } from './user-authentication.role';

// User authentication service. It does what it says.
// This one's fairly important. It'll have to handle passwords, auth tokens,
// and whatever else we decide to throw in. But all that can come once we
// have some idea of what we're doing.

@Injectable()
export class UserAuthenticationService {
    constructor(
        @InjectRepository(UserAuthentication)
        private readonly authRepository: Repository<UserAuthentication>,
        private readonly userService: UserService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService
    ) {}

    // Number of salt rounds used for bcrypt
    saltRounds = 12;

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

    async validateLogin(login: LoginDto): Promise<UserAuthentication> {
        const user = await this.userService.findByName(login.username);

        if (user) {
            const auth = await this.authRepository.findOne({ user: user });

            if (auth) {
                const isPasswordCorrect =  await bcrypt.compare(login.password, auth.password);

                if (isPasswordCorrect) {
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

    // Create a new account. Note that this is for authentication first.
    // We'll also have to create the user.
    async createAccount(account: CreateAccountDto, role?: UserRole): Promise<UserAuthentication> {
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
}
