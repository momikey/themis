import { Controller, Get, Param, NotFoundException, Post as HttpPost, UseGuards, Body } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { UserAuthenticationService } from '../../user/user-authentication/user-authentication.service';
import { UserRole } from '../../user/user-authentication/user-authentication.role';
import { User } from '../../entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDto } from '../../dtos/update-user-profile.dto';

@Controller('api/v1/user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly authService: UserAuthenticationService
    ) {}

    @Get('get-user/:name')
    async getLocalUser(@Param('name') username: string): Promise<User> {
        return this.userService.findLocalByName(username);
    }

    @Get('get-user/:name/:server')
    async getGlobalUser(@Param('name') username: string, @Param('server') server: string): Promise<User> {
        return this.userService.findGlobalByName(username, server);
    }

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

    @HttpPost('update-profile/:user')
    @UseGuards(AuthGuard('jwt'))
    async updateProfile(@Body() user: UpdateUserDto): Promise<User> {
        return this.userService.updateLocalUser(user);
    }
}
