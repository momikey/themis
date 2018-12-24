import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user.service';
import { JwtPayload } from './jwt.interface';
import { User } from '../user.entity';

// User authentication service. It does what it says.
// This one's fairly important. It'll have to handle passwords, auth tokens,
// and whatever else we decide to throw in. But all that can come once we
// have some idea of what we're doing.

@Injectable()
export class UserAuthenticationService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) {}

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
}
