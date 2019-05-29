import { Controller, Get, Param, NotFoundException, Post as HttpPost, UseGuards, Body } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { UserAuthenticationService } from '../../user/user-authentication/user-authentication.service';
import { UserRole } from '../../user/user-authentication/user-authentication.role';
import { User } from '../../entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDto } from '../../dtos/update-user-profile.dto';
import { Post } from '../../entities/post.entity';

/**
 * These endpoints deal with users. Users in Themis are separated
 * from accounts; foreign users can be stored in a server's database,
 * but only local accounts are. Posting itself is tied to accounts,
 * while profile information (such as a bio) are stored as part of a
 * user's record.
 *
 * @export
 * @class UserController
 */
@Controller('api/v1/user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly authService: UserAuthenticationService
    ) {}

    /**
     * Get the database entry for a local user, given their name.
     *
     * @param username The name of a user on this server
     * @returns The database object for that user
     * @memberof UserController
     */
    @Get('get-user/:name')
    async getLocalUser(@Param('name') username: string): Promise<User> {
        return this.userService.findLocalByName(username);
    }

    /**
     * Get the local database entry for any user this server knows
     * about, no matter where they originate.
     *
     * @param username The name of the user
     * @param server The hostname of the user's home server
     * @returns The database object for the user
     * @memberof UserController
     */
    @Get('get-user/:name/:server')
    async getGlobalUser(@Param('name') username: string, @Param('server') server: string): Promise<User> {
        return this.userService.findGlobalByName(username, server);
    }

    /**
     * Get the IDs of all posts a given user on this server has liked.
     * We use a separate endpoint for this to keep from sending the full
     * list of posts multiple times.
     *
     * @param username The name of the user
     * @returns A list of database IDs for the user's liked posts
     * @memberof UserController
     */
    @Get('get-like-ids/:name')
    async getLocalUserLikeIds(@Param('name') username: string): Promise<number[]> {
        try {
            const user = await this.userService.findLocalByName(username);

            return (await this.userService.getLikes(user)).liked.map(l => l.id);
        } catch (e) {
            throw new NotFoundException(`User ${username} does not exist on this server`);
        }
    }

    /**
     * Get all the posts a user has liked. This does return full posts,
     * not only IDs or metadata, so beware of data usage.
     *
     * @param username The name of the user
     * @returns An array of database entities for posts the user has liked
     * @memberof UserController
     */
    @Get('get-likes/:name')
    async getLocalUserLikes(@Param('name') username: string): Promise<Post[]> {
        try {
            const user = await this.userService.findLocalByName(username);

            return (await this.userService.getLikes(user)).liked;
        } catch (e) {
            throw new NotFoundException(`User ${username} does not exist on this server`);
        }
    }

    /**
     * Check whether a user has a given permission. These are privileges,
     * such as posting, creating groups, etc. Note that only local users
     * actually have permissions on this server; strictly speaking, that
     * should make this endpoint part of the account portion. In the future,
     * it may move there.
     *
     * @param username The name of a local user
     * @param permission The permission
     * @returns A boolean indicating whether the user can perform the desired
     * action
     * @memberof UserController
     */
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

    /**
     * Update a user's profile. This is the information displayed
     * when a user's name is clicked in the frontend, such as their
     * bio and avatar.
     *
     * @param user A DTO containing the new data for the user
     * @returns The updated database object for the user
     * @memberof UserController
     */
    @HttpPost('update-profile/:user')
    @UseGuards(AuthGuard('jwt'))
    async updateProfile(@Body() user: UpdateUserDto): Promise<User> {
        return this.userService.updateLocalUser(user);
    }
}
