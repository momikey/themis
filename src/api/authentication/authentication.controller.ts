import { Controller, UseGuards, Post, Body, Get, Param, BadRequestException } from '@nestjs/common';
import { UserAuthenticationService } from '../../user/user-authentication/user-authentication.service';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto } from '../../dtos/login.dto';
import { TokenDto } from '../../dtos/token.dto';
import { UserRole } from '../../user/user-authentication/user-authentication.role';
import { CreateAccountDto } from '../../dtos/create-account.dto';
import { Account } from '../../entities/account.entity';

/**
 * This controller handles authentication endpoints, such as
 * creating new accounts, logging into existing ones, and so on.
 * It also allows resetting passwords, checking user roles, etc.
 *
 * @export
 * @class AuthenticationController
 */
@Controller('api/v1/authentication')
export class AuthenticationController {
    constructor(
        private readonly accountService: UserAuthenticationService,
    ) {}

    /**
     * Create a new account on this server. This will need a lot of
     * security stuff, but things like CAPTCHAs will be up to the
     * admins of each individual server.
     * 
     * Note that Themis does *not* store passwords in plain text.
     * All passwords are hashed before they enter the database, using
     * a server-specific secret key.
     *
     * @param user A DTO containing the new account's username, email,
     * and password
     * @returns The database entry for the new account
     * @memberof AuthenticationController
     */
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

    /**
     * Validate a user's login attempt. If successful, this will
     * send back a JWT token, which is then used to access
     * "privileged" endpoints such as posting. In theory, there's
     * no real differnce between a regular user and a bot, so that's
     * why there isn't any role-specific code here.
     * 
     * HTTPS is up to server admins; we don't require it, but you
     * should strongly consider it.
     *
     * @param user A DTO containing the username and password
     * @returns A DTO containing the user's API token and its
     * expiration time
     * @memberof AuthenticationController
     */
    @Post('login')
    @UseGuards(AuthGuard('local'))
    async login(@Body() user: LoginDto): Promise<TokenDto> {
        return this.accountService.createLoginToken(user);
    }

    /**
     * Get a user's role. Different roles can be assigned different
     * permissions. For instance, bots can be allowed or denied
     * follow privileges. (Note that we don't yet have any way to
     * *set* these. That's coming soon.)
     *
     * @param username The name of the local user
     * @returns The role of that user
     * @memberof AuthenticationController
     */
    @Get('role/:name')
    @UseGuards(AuthGuard('jwt'))
    async getUserRole(@Param('name') username: string): Promise<UserRole> {
        return this.accountService.getUserRole(username);
    }
}
