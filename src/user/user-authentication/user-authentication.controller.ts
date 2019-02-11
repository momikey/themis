import { Controller, Post, Body, Get, UseGuards, Res, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { UserAuthenticationService } from './user-authentication.service';
import { JwtPayload } from './jwt.interface';
import { CreateAccountDto } from './create-account.dto';
import { LoginDto } from './login.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserAuthentication } from './user-authentication.entity';
import { TokenDto } from './token.dto';

@Controller('internal/authenticate')
export class UserAuthenticationController {
    constructor(private readonly authService: UserAuthenticationService) {}

    @Post('create-token')
    async createToken(@Body() user: JwtPayload): Promise<TokenDto> {
        try {
            const result = await this.authService.createToken(user);

            return result;
        } catch (e) {
            throw new InternalServerErrorException('Unable to create API token');
        }
    }

    @Post('create-account')
    async createAccount(@Body() user: CreateAccountDto): Promise<UserAuthentication> {
        try {
            const result = await this.authService.createAccount(user);

            return result;
        } catch (e) {
            throw new BadRequestException("Could not create this account");
        }
    }

    @Post('login')
    @UseGuards(AuthGuard('local'))
    async verifyLogin(@Body() user: LoginDto): Promise<TokenDto> {
        return this.authService.createLoginToken(user);
    }
}
