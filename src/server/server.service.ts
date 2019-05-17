import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Server } from '../entities/server.entity';
import { ConfigService } from '../config/config.service';
import { Repository } from 'typeorm';
import * as URI from 'uri-js';
import { CreateServerDto } from '../dtos/create-server.dto';

/**
 * Despite the dumb name, this service allows us to work
 * with Themis servers as they are stored in the database.
 * 
 * There aren't too many operations we need to worry about
 * with this one, but it does have the added wrinkle of
 * storing the *local* server in the DB on first run.
 *
 * @export
 * @class ServerService
 */
@Injectable()
export class ServerService {
    /**
     * Creates a ServerService. This is tricky, because we
     * also need to add an entry to the database on first
     * run. Thus, this is the only service (so far) that
     * actually does something in its constructor. It's all
     * handled behind the scenes, though, so other parts of
     * the platform shouldn't have to worry about it.
     * 
     * @param serverRepository
     * @param configService
     * @memberof ServerService
     */
    constructor(
        @InjectRepository(Server)
        private readonly serverRepository: Repository<Server>,
        private readonly configService: ConfigService
    ) {
        const local = serverRepository.create({
            host: configService.serverAddress,
            port: configService.serverPort,
            scheme: configService.isHttps ? 'https': 'http'
        });

        // We can't use async/await here, because we're just not
        // set up for that. So that's why this part uses bare Promises.
        serverRepository.findOneOrFail(local)
            .then(_ => true)
            .catch(_ => serverRepository.save(local))
    }

    /**
     * Find a server given some data about it.
     *
     * @param server An incomplete server object
     * @returns The full server object
     * @memberof ServerService
     */
    async find(server: Partial<Server>): Promise<Server> {
        return this.serverRepository.findOneOrFail(server);
    }

    /**
     * Find a server given its hostname. As there is the chance,
     * albeit small, that two servers could run on the same host
     * but with different ports, we have to return an array rather
     * than a single object.
     *
     * @param host The hostname
     * @returns Any known server with that hostname, all in an array
     * @memberof ServerService
     */
    async findByHost(host: string): Promise<Server[]> {
        return this.serverRepository.find({host});
    }

    /**
     * Get a server based on its known properties. If the database
     * doesn't have an entry for it, then create it.
     *
     * @param server A DTO containing the server's host, port, and scheme
     * @returns The server's database entry, which is created if it doesn't exist
     * @memberof ServerService
     */
    async findOrCreate(server: CreateServerDto): Promise<Server> {
        if (server.host == undefined) {
            return Promise.reject('No host given');
        } else {
            const result = await this.find({
                host: server.host,
                port: server.port,
                scheme: server.scheme
            });

            if (result != undefined) {
                return result;
            } else {
                return this.insert(server);
            }
        }
    }

    /**
     * Get the local server's info. This is derived from
     * the configuration options set in `config.env`.
     * Note that we can't simply search for `ID=1`, beccause
     * a server move would violate that expectation. (Then again,
     * server moves break federation already, so...we'll have to
     * look into that.)
     * 
     * @returns The DB entity representing the local server
     * @memberof ServerService
     */
    async local(): Promise<Server> {
        return this.serverRepository.findOne({
            host: this.configService.serverAddress,
            port: this.configService.serverPort
        });
    }

    /**
     * Given a server, determine whether it is the local one.
     * This is necessary for federation control, as well as a
     * few frontend tasks.
     *
     * @param server A server object from the database
     * @returns Whether that object represents the local server
     * @memberof ServerService
     */
    isLocal(server: Server): boolean {
        return (
            server.host == this.configService.serverAddress &&
            server.port == this.configService.serverPort &&
            server.scheme === (this.configService.isHttps ? 'https' : 'http')
        );
    }

    /**
     * Get the local server's full host information as a URI.
     * This is a little misnamed, I'll admit, but I couldn't
     * think of a better name.
     *
     * @returns The hostname for the server as a fully-qualified URI
     * @memberof ServerService
     */
    localHostname(): string {
        const parts = {
            host: this.configService.serverAddress,
            port: this.configService.serverPort,
            scheme: (this.configService.isHttps ? 'https' : 'http')
        };

        return URI.normalize(URI.serialize(parts));
    }

    /**
     * Add a new server to the database.
     *
     * @param server A DTO containing the server's info
     * @returns The newly-created server entity
     * @memberof ServerService
     */
    async insert(server: CreateServerDto): Promise<Server> {
        const serverEntity = this.serverRepository.create({
            host: server.host,
            port: server.port,
            scheme: server.scheme
        })
        return this.serverRepository.save(serverEntity);
    }

    /**
     * Update a server's information. This *might* break federation.
     * We'll have to look into that later on.
     *
     * @param server A partial or complete server object, possibly
     * with updated information
     * @returns The updated server entity
     * @memberof ServerService
     */
    async update(server: Partial<Server>): Promise<Server> {
        const newEntity = Object.assign(await this.find(server), server);

        return this.serverRepository.save(newEntity);
    }

    /**
     * Delete a server's database entry. Note that this would disrupt
     * any psots, groups, aor users originating from that server, so
     * it's not an operation to be undertaken lightly.
     *
     * @param server A partial or complete server object representing
     * the server or servers to delete
     * @returns The deleted entities
     * @memberof ServerService
     */
    async delete(server: Partial<Server>): Promise<Server[]> {
        const entityToDelete = await this.find(server);

        return this.serverRepository.remove([entityToDelete]);
    }

    /**
     * Parse a host URI to get its address, port, and scheme for
     * entry into the database.
     *
     * @param host A URI (doesn't need to be fully qualified)
     * @returns A DTO suitable for inserting into the database
     * @memberof ServerService
     */
    parseHostname(host: string): CreateServerDto {
        // We may be passed bare host names, which technically *aren't*
        // URIs. Adding the double-slash to the start, however, works
        // to transform it into one.
        const hostAsUri = (host.includes('//') ? host : '//' + host);
        const parsed = URI.parse(hostAsUri);
        return {
            host: parsed.host || this.configService.serverAddress,
            scheme: parsed.scheme || 'http',
            port: +parsed.port || this.configService.serverPort
        }
    }
}
