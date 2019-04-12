import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { UserAuthenticationService } from '../../user/user-authentication/user-authentication.service';
import { UserRole } from '../../user/user-authentication/user-authentication.role';

@Controller('api/v1/user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly authService: UserAuthenticationService
    ) {}

    @Get('get-permission/:user/:perm')
    async getPermission(@Param('user') username: string, @Param('perm') permission: string) : Promise<boolean> {
        // TODO Implement user permissions
        // For now, just assume non-admins can't do anything but post
        const role = this.authService.getUserRole(username);

        try {
            return (await role) === UserRole.Admin;
        } catch (e) {
            throw new NotFoundException(`User ${username} does not exist on this server`);
        }
    }
}
