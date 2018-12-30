import { Controller, Post, Body, Get, UseGuards, Res, UnauthorizedException } from '@nestjs/common';
import { UserAuthenticationService } from './user-authentication.service';
import { JwtPayload } from './jwt.interface';
import { CreateAccountDto } from './create-account.dto';
import { LoginDto } from './login.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('internal/authenticate')
export class UserAuthenticationController {
    constructor(private readonly authService: UserAuthenticationService) {}

    @Post('create-token')
    async createToken(@Body() user: JwtPayload): Promise<any> {
        const result = await this.authService.createToken(user);

        return result;
    }

    @Post('create-account')
    async createAccount(@Body() user: CreateAccountDto): Promise<any> {
        try {
            const result = await this.authService.createAccount(user);

            return result;
        } catch (e) {
            return e;
        }
    }

    @Post('login')
    async verifyLogin(@Body() user: LoginDto): Promise<any> {
        if (await this.authService.validateLogin(user)) {
            return this.authService.createLoginToken(user);
        } else {
            throw new UnauthorizedException("Invalid username or password");
        }
    }

    @Get('post-login')
    postLogin() {
        return '/web';
    }
}
