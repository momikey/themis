import Axios from "axios";
import * as numberFormat from 'number-format.js';
import * as URI from 'uri-js';
import { CreateAccountDto } from "../dtos/create-account.dto";
import { Server } from "../entities/server.entity";
import { formatServer } from "../server/format-server";

/**
 * This service functions as a layer of indirection betweent
 * client and server, encapsulating Themis backend API requests
 * and other common tasks that we would otherwise need to repeat
 * all throughout the frontend.
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
    static getNodeinfo(): Promise<any> {
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
    static getGroupList(): Promise<any> {
        return Axios.get('/api/v1/group/list');
    }

    static createAccount(accountInfo: CreateAccountDto): Promise<any> {
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
    static login(username: string, password: string): Promise<any> {
        return Axios.post('/api/v1/authentication/login', {
            username,
            password
        });
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
    static getUserRole(username: string, accessToken: string): Promise<any> {
        return Axios.get(`/api/v1/authentication/role/${username}`, {
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
     * Format a server object into a URI
     *
     * @static
     * @param server A Server object
     * @returns A normalized URI for the server
     * @memberof FrontendService
     */
    static serverUri(server: Server): string {
        return URI.normalize(URI.serialize(server));
    }

    static prettyServer(server: Server): string {
        return formatServer(server);
    }
}