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
    async createToken(user: JwtPayload) {
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

    async validateUser(payload: JwtPayload): Promise<any> {
        // TODO: temp method
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

    async validateLogin(login: LoginDto): Promise<boolean> {
        const user = await this.userService.findByName(login.username);

        if (user) {
            const auth = await this.authRepository.findOneOrFail({ user: user });

            if (auth) {
                return bcrypt.compare(login.password, auth.password);
            }
        }
    }

    // Create a new account. Note that this is for authentication first.
    // We'll also have to create the user.
    async createAccount(account: CreateAccountDto): Promise<UserAuthentication> {
        if (await this.validateAccount(account)) {
            const newUser = await this.userService.createEmptyUserEntry(account.username);
            
            const result = bcrypt.hash(account.password, this.saltRounds)
                .then((hash) => {
                    const auth = this.authRepository.create({
                        user: newUser,
                        email: account.email,
                        reset: false,
                        password: hash
                    });

                    this.authRepository.save(auth);

                    return auth;
                });

            return result;
        } else {
            throw new BadRequestException;
        }
    }
}
