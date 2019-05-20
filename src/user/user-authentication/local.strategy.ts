import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import { UserAuthenticationService } from "./user-authentication.service";
import { ConfigService } from "src/config/config.service";

/**
 * The "local" strategy is a simple user/password setup. We only use
 * it for the initial authentication phase (logging in). The result,
 * assuming a successful login, is a JWT token, which will be used
 * for all further API access.
 *
 * @export
 * @class LocalStrategy
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
    constructor(
        private readonly authService: UserAuthenticationService,
        private readonly configService: ConfigService
    ) {
        super();
    }

    async validate(username: string, password: string) {
        if (!password) {
            throw new UnauthorizedException('No password given');
            
        }

        try {
            const user = await this.authService.validateLogin({username, password});            
            return user;
        } catch (e) {
            throw new UnauthorizedException(e);
        }
    }
}