import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import { UserAuthenticationService } from "./user-authentication.service";
import { ConfigService } from "src/config/config.service";

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
            console.log(e);
            throw new UnauthorizedException(e);
        }
    }
}