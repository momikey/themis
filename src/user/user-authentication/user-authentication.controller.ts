import { Controller, Post, Body } from '@nestjs/common';
import { UserAuthenticationService } from './user-authentication.service';
import { JwtPayload } from './jwt.interface';

@Controller('internal/authenticate')
export class UserAuthenticationController {
    constructor(private readonly authService: UserAuthenticationService) {}

    @Post('create-token')
    async createToken(@Body() user: JwtPayload): Promise<any> {
        const result = await this.authService.createToken(user);

        console.log(result.accessToken);

        return result;
    }
}
