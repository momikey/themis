import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UserAuthenticationService } from "./user-authentication.service";
import { JwtPayload } from "./jwt.interface";
import { ConfigService } from "../../config/config.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private readonly authService: UserAuthenticationService,
        private readonly configService: ConfigService
        ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            // audience: configService.serverAddress,

            // TODO: Change this for production
            secretOrKey: 'secretKey'
        });
    }

    async validate(payload: JwtPayload) {
        const user = await this.authService.validateUser(payload);
        if (!user) {
            throw new UnauthorizedException();
        }

        return user;
    }
}