import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { Injectable } from '@nestjs/common';

export interface EnvConfig {
    [key: string]: string;
}

export class ConfigService {
    private readonly envConfig: EnvConfig;

    constructor(filePath: string) {
        this.envConfig = dotenv.parse(fs.readFileSync(filePath));
    }

    get serverAddress(): string {
        return this.envConfig.SERVER_ADDRESS || '';
    }

    get serverPort(): number {
        // TODO: Real port stuff, including HTTPS.
        return Number.parseInt(this.envConfig.SERVER_PORT, 10) ||
            (this.isHttps ? 443 : 80);
    }

    get isFederating(): boolean {
        // TODO: Handle federation
        return Boolean(this.envConfig.FEDERATED_SERVER) || false;
    }

    get isHttps(): boolean {
        return Boolean(this.envConfig.USE_HTTPS) || false;
    }
}
