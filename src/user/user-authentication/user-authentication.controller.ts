import { Controller, Post, Body, Get, UseGuards, Res, UnauthorizedException, BadRequestException, InternalServerErrorException, Param } from '@nestjs/common';
import { UserAuthenticationService } from './user-authentication.service';
import { JwtPayload } from './jwt.interface';
import { CreateAccountDto } from './create-account.dto';
import { LoginDto } from './login.dto';
import { AuthGuard } from '@nestjs/passport';
import { Account } from './account.entity';
import { TokenDto } from './token.dto';
import { UserRole } from './user-authentication.role';
import { RoleDto } from './role.dto';

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
    async createAccount(@Body() user: CreateAccountDto): Promise<Account> {
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

    @Get('user-role/:name')
    @UseGuards(AuthGuard('jwt'))
    async getUserRole(@Param('name') name: string): Promise<UserRole> {
        return this.authService.getUserRole(name);
    }

    @Post('user-role-change')
    @UseGuards(AuthGuard('jwt'))
    async changeUserRole(@Body() role: RoleDto): Promise<Account> {
        const auth = await this.authService.findOne(role.username);
        return this.authService.changeRole(auth, role.newRole);
    }

    @Get('user-authentication/:name')
    @UseGuards(AuthGuard('jwt'))
    async getUserAuthentication(@Param('name') name: string): Promise<Account> {
        try {
            const auth = await this.authService.findOne(name);
            return auth;
        } catch (e) {
            throw new BadRequestException(`Unable to retrieve data for user ${name}`);
        }
    }
}
