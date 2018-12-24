import { Controller, Get, Param, Post } from '@nestjs/common';
import { UserAuthenticationService } from './user-authentication.service';

@Controller('internal/authenticate')
export class UserAuthenticationController {
    constructor(private readonly authService: UserAuthenticationService) {}

    @Post('create-token')
    async createToken(@Param('username') username: string): Promise<any> {
        const result = await this.authService.createToken(username);

        console.log(result.accessToken);

        return result;
    }
}
