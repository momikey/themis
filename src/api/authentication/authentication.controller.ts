import { Controller, UseGuards, Post, Body, Get, Param, BadRequestException } from '@nestjs/common';
import { UserAuthenticationService } from '../../user/user-authentication/user-authentication.service';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto } from '../../dtos/login.dto';
import { TokenDto } from '../../dtos/token.dto';
import { UserRole } from '../../user/user-authentication/user-authentication.role';
import { CreateAccountDto } from '../../dtos/create-account.dto';
import { Account } from '../../entities/account.entity';

@Controller('api/v1/authentication')
export class AuthenticationController {
    constructor(
        private readonly accountService: UserAuthenticationService,
    ) {}

    @Post('create-account')
    async createAccount(@Body() user: CreateAccountDto): Promise<Account> {
        // TODO We need rate-limiting and probably some kind of guard
        // to stop spam account creation.
        try {
            return await this.accountService.createAccount(user);
        } catch (e) {
            throw new BadRequestException(e);
        }
    }

    @Post('login')
    @UseGuards(AuthGuard('local'))
    async login(@Body() user: LoginDto): Promise<TokenDto> {
        return this.accountService.createLoginToken(user);
    }

    @Get('role/:name')
    @UseGuards(AuthGuard('jwt'))
    async getUserRole(@Param('name') username: string): Promise<UserRole> {
        return this.accountService.getUserRole(username);
    }
}
