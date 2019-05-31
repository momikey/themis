import Axios, { AxiosPromise } from "axios";
import * as numberFormat from 'number-format.js';
import * as URI from 'uri-js';
import { CreateAccountDto } from "../dtos/create-account.dto";
import { Server } from "../entities/server.entity";
import { formatServer } from "../server/format-server";
import { Group } from "../entities/group.entity";
import { Post } from "../entities/post.entity";
import { User } from "../entities/user.entity";
import { CreateGroupDto } from "../dtos/create-group.dto";
import { NodeInfo } from "../activitypub/nodeinfo/nodeinfo.schema";
import { Account } from "../entities/account.entity";
import { TokenDto } from "../dtos/token.dto";
import { UserRole } from "../user/user-authentication/user-authentication.role";

/**
 * This service functions as a layer of indirection betweent
 * client and server, encapsulating Themis backend API requests
 * and other common tasks that we would otherwise need to repeat
 * all throughout the frontend.
 * 
 * TODO: Should we use vue-resource instead of axios? Also,
 * consider handling response body/error stuff in here instead
 * of forcing the callers to do it.
 *
 * @export
 * @class FrontendService
 */
export class FrontendService {
    /**
     * Get the Nodeinfo for this server.
     *
     * @static
     * @returns An Axios response whose `data` member is an object
     * following the Nodeinfo schema (currently version 2.1)
     * @memberof FrontendService
     */
    static getNodeinfo(): AxiosPromise<NodeInfo> {
        return Axios.get('/.well-known/nodeinfo');
    }

    /**
     * Retrieve the list of all groups the server knows.
     *
     * @static
     * @returns An Axios response whose `data` member is
     * a list of Group entities (see API documentation for format)
     * @memberof FrontendService
     */
    static getGroupList(sortBy? : string, descending? : boolean): AxiosPromise<Group[]> {
        const sortQuery = sortBy ? `?sort=${sortBy}` : '';
        const descQuery = descending ? '&desc=1' : '';

        if (descQuery && !sortQuery) {
            // Can't ask for descending order with no sort criteria
            throw new Error("You must specify a sort column");
        }

        return Axios.get(`/api/v1/group/list${sortQuery}${descQuery}`);
    }

    /**
     * Attempt to create a group on the local server. This won't
     * necessarily succeed, as it's possible that the user lacks
     * permission to create new groups.
     *
     * @static
     * @param accessToken The user's API token
     * @param name The "short" name of the new group (cf. username)
     * @param displayName The user-friendly name for the group
     * @param summary A brief description of the group
     * @returns An Axios response whose `data` member holds the new group's
     * database entity
     * @memberof FrontendService
     */
    static createGroup(accessToken: string, name: string, displayName: string, summary: string)
        : AxiosPromise<Group> {
        const dto : CreateGroupDto = {
            name,
            displayName,
            summary
        };

        return Axios.post(`/api/v1/group/create-group`, dto, {
            headers: { 'Authorization': `bearer ${accessToken}` }
        });
    }

    /**
     * Get a group given its database ID (on the local server).
     *
     * @static
     * @param id The ID number for the group
     * @returns An Axios response whoe `data` member is the group's DB entity
     * @memberof FrontendService
     */
    static getGroupFromId(id: number): AxiosPromise<Group> {
        return Axios.get(`/api/v1/group/get-by-id/${id}`);
    }

    /**
     * Get all the threads in a group, optionally since a given date.
     *
     * @static
     * @param group The entity for the group
     * @param [since] An optional cutoff date
     * @returns An Axios response containing an array of Post entities
     * @memberof FrontendService
     */
    static getGroupThreads(group: Group, since?: number): AxiosPromise<Post[]> {
        const sinceQuery = since ? `?since=${since}` : '';

        return Axios.get(`/api/v1/group/get-top-level-posts/${group.id}${sinceQuery}`);
    }

    /**
     * Get a post and its children, as the `getGroupThreads()` method
     * only returns the top-level posts.
     *
     * @static
     * @param post The post entity
     * @returns An Axios response containing the same post, but with its
     * `children` property filled with the post's descendants tree
     * @memberof FrontendService
     */
    static getFullPost(post: Post): AxiosPromise<Post> {
        return Axios.get(`/api/v1/post/get-with-children/${post.id}`);
    }

    /**
     * Get the children of a post. Unlike `getFullPost()`, this doesn't
     * return the initial post.
     *
     * @static
     * @param post The post entity
     * @returns An Axios response containing an array of Post entities
     * @memberof FrontendService
     */
    static getChildrenOfPost(post: Post): AxiosPromise<Post[]> {
        return Axios.get(`/api/v1/post/get-children/${post.id}`);
    }

    /**
     * Retrieve whether a user has permission to perform a given action.
     *
     * @static
     * @param username The name of the user
     * @param permission The name of the permission
     * @returns An Axios response whose `data` member is a boolean indicaing
     * whether the user has the given permission
     * @memberof FrontendService
     */
    static getUserPermission(username: string, permission: string): AxiosPromise<boolean> {
        return Axios.get(`/api/v1/user/get-permission/${username}/${permission}`);
    }

    /**
     * Attmpt to create an account on the server.
     *
     * @static
     * @param accountInfo A structure containing the username and password of the user
     * @returns An Axios response whose `data` member contains the info
     * for the new account, or an error if it could not be created
     * @memberof FrontendService
     */
    static createAccount(accountInfo: CreateAccountDto): AxiosPromise<Account> {
        return Axios.post('/api/v1/authentication/create-account', accountInfo);
    }

    /**
     * Send a login request to the server.
     *
     * @static
     * @param username The name of the user logging in
     * @param password The user's password
     * @returns An Axios response; if successful, the `data` member
     * will contain a login token. If a failure,  an appropriate error.
     * @memberof FrontendService
     */
    static login(username: string, password: string): AxiosPromise<TokenDto> {
        return Axios.post('/api/v1/authentication/login', {
            username,
            password
        });
    }

    /**
     * Get a local user, i.e., one registered on the local server.
     *
     * @static
     * @param username The user's name
     * @returns An Axios response containing a User database entity
     * @memberof FrontendService
     */
    static getLocalUser(username: string): AxiosPromise<User> {
        return Axios.get(`/api/v1/user/get-user/${username}`);
    }

    /**
     * Update a user's "profile" information. This includes the
     * primary fields of an ActivityPub Actor object, such as
     * display name and summary (aka bio), as well as a URI for
     * an avatar (not implemented yet). Note that this only allows
     * updateing users local to this server.
     *
     * @static
     * @param username The user's name
     * @param accessToken The user's API token
     * @param profile The updated profile object
     * @returns An Axios response containing the updated User entity
     * @memberof FrontendService
     */
    static updateUserProfile(
        username: string,
        accessToken: string,
        profile: any
    ): AxiosPromise<User> {
        const data: any = {
            name: username,
            displayName: profile.displayName || undefined,
            summary: profile.summary || undefined,
            icon: profile.avatarUri || undefined
        };

        return Axios.post(`/api/v1/user/update-profile/${username}`, data, {
            headers: { 'Authorization': `bearer ${accessToken}` }
        })
    }

    /**
     * Gets the "role" of the user: user, moderator, admin, etc.
     *
     * @static
     * @param username The name of the user
     * @param accessToken The token given upon login
     * @returns An Axios response containing in the `data` member the user's role
     * @memberof FrontendService
     */
    static getUserRole(username: string, accessToken: string): AxiosPromise<UserRole> {
        return Axios.get(`/api/v1/authentication/role/${username}`, {
            headers: { 'Authorization': `bearer ${accessToken}` }
        });
    }

    /**
     * Get the IDs of all a user's liked posts. This uses less data
     * than retrieving a full post list, so use it if we already have
     * the posts.
     *
     * @static
     * @param username The name of the local user
     * @param accessToken The user's API token
     * @returns An Axios response containing a list of post IDs
     * @memberof FrontendService
     */
    static getUserLikeIds(username: string, accessToken: string): AxiosPromise<number[]> {
        return Axios.get(`/api/v1/user/get-like-ids/${username}`, {
            headers: { 'Authorization': `bearer ${accessToken}` }
        });
    }

    /**
     * Get all of a user's liked posts. This *does* download the full
     * post entities, which may be a considerable amount of data. Thus,
     * we only use this in cases where we don't already have a list of posts.
     *
     * @static
     * @param username The name of the local user
     * @param accessToken The user's API token
     * @returns An Axios response containing an array of post entities
     * @memberof FrontendService
     */
    static getLikedPosts(username: string, accessToken: string): AxiosPromise<Post[]> {
        return Axios.get(`/api/v1/user/get-likes/${username}`, {
            headers: { 'Authorization': `bearer ${accessToken}` }
        });
    }

    /**
     * Format an integer for display in the frontend. Basically, this
     * just inserts commas for separators.
     *
     * @static
     * @param num The number to format
     * @returns A string representation of the number
     * @memberof FrontendService
     */
    static formatNumber(num: number): string {
        // TODO: Locale-aware
        return numberFormat('#,###,##0.', num);
    }

    /**
     * Format a server object into a URI.
     *
     * @static
     * @param server A Server object
     * @returns A normalized URI for the server
     * @memberof FrontendService
     */
    static serverUri(server: Server): string {
        return URI.normalize(URI.serialize(server));
    }

    /**
     * Pretty-print a server URI
     *
     * @static
     * @param server An object containing the server's host info
     * @returns A formatted string suitable for use in Webfinger-like contexts
     * @memberof FrontendService
     */
    static prettyServer(server: Server): string {
        return server ? formatServer(server) : "unknown server";
    }

    /**
     * Format a group object into a Webfinger-style string.
     *
     * @static
     * @param group The group object, as returned by the server
     * @returns A string in the format "@group-*name*@server"
     * @memberof FrontendService
     */
    static formatGroupName(group: Group) {
        const address = `@group-${group.name}@${this.prettyServer(group.server)}`
        return address;
    }

    /**
     * Format a user object into a Webfinger-style string.
     *
     * @static
     * @param user The user object, as returned by the server
     * @returns A string in the format "@username@server"
     * @memberof FrontendService
     */
    static formatUserName(user: User) {
        const address = `@${user.name}@${this.prettyServer(user.server)}`;
        return address;
    }
}