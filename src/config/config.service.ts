import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { Injectable } from '@nestjs/common';

/**
 * Helper interface for configuration.
 *
 * @export
 * @interface EnvConfig
 */
export interface EnvConfig {
    [key: string]: string;
}

/**
 * Configuration for the server itself. These are the things
 * that can't really be changed from within the Themis platform.
 * They're read in on server start, and they require a restart
 * to change.
 *
 * @export
 * @class ConfigService
 */
export class ConfigService {
    private readonly envConfig: EnvConfig;

    /**
     * Creates the service. Note that, unlike most other services
     * in Themis, this one requires an argument that is not
     * injected by Nest. That's okay, though, because the module
     * handles it.
     * 
     * @param filePath The path to the server config file
     * @memberof ConfigService
     */
    constructor(filePath: string) {
        this.envConfig = dotenv.parse(fs.readFileSync(filePath));
    }

    /**
     * Get the address for this server; it can be a hostname or
     * IP address.
     *
     * @readonly
     * @memberof ConfigService
     */
    get serverAddress(): string {
        return this.envConfig.SERVER_ADDRESS || '';
    }

    /**
     * Get the port the server is listening on. By default, we use
     * the appropriate port for HTTP(S), but we can use others.
     * (For example, the dev server runs on port 3000, because that's
     * the default for Nest/Express.)
     *
     * @readonly
     * @memberof ConfigService
     */
    get serverPort(): number {
        // TODO: Real port stuff, including HTTPS.
        return Number.parseInt(this.envConfig.SERVER_PORT, 10) ||
            (this.isHttps ? 443 : 80);
    }

    /**
     * Is this server federating? By setting this value to `true`,
     * the admin can connect to other servers in the Themis network,
     * or even other AP platforms. (Well, once we implement that.)
     *
     * @readonly
     * @memberof ConfigService
     */
    get isFederating(): boolean {
        // TODO: Handle federation
        return Boolean(this.envConfig.FEDERATED_SERVER) || false;
    }

    /**
     * Is this server running HTTPS? That's probably a good idea
     * for any server, of course, but we don't *require* it. Mostly,
     * that's for dev purposes.
     *
     * @readonly
     * @memberof ConfigService
     */
    get isHttps(): boolean {
        return Boolean(this.envConfig.USE_HTTPS) || false;
    }
}
