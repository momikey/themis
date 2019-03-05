import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

/**
 * This entity tracks a Themis server. Each entity contains
 * a fully-qualified host name (which can include subdomains),
 * a port, and a scheme. By default, Themis assumes HTTPS,
 * but simple HTTP is allowed, as are nonstandard ports.
 *
 * @export
 * @class Server
 */
@Entity()
export class Server {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * The full host name of the server, including subdomains
     *
     * @memberof Server
     */
    @Column()
    host: string;

    /**
     * The port of the server, defaults to 443 (HTTPS).
     *
     * @memberof Server
     */
    @Column({ default: 443 })
    port: number;

    /**
     * The scheme the server uses, defaults to HTTPS, but
     * plain HTTP is allowed. (Note that, while Themis will
     * support NNTP, this is in addition to the regular
     * HTTP(S) server support, which is considered the default.
     *
     * @memberof Server
     */
    @Column({ default: 'https' })
    scheme: string;
}