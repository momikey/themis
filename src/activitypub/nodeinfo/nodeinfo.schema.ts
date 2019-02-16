/**
 * An object representing the NodeInfo schema
 * 
 * As of right now, we implement version 2.1, but this may change.
 *
 * @export
 * @class NodeInfo
 */
export interface NodeInfo {

    /**
     * The schema version.
     *
     * @memberof NodeInfo
     */
    version: '2.1';

    /**
     * Metadata about server software in use.
     *
     * @memberof NodeInfo
     */
    software: Software;

    /**
     * The protocols supported by this server.
     *
     * @memberof NodeInfo
     */
    protocols: Protocol[];

    /**
     * Third-party sites this server can connect to.
     *
     * @memberof NodeInfo
     */
    services: {
        inbound: InboundServices[],
        outbound: OutboundServices[]
    };

    /**
     * Whether this server allows open registration.
     *
     * @memberof NodeInfo
     */
    openRegistrations: boolean;

    /**
     * Usage statistics for this server.
     *
     * @memberof NodeInfo
     */
    usage: UsageStats;


    /**
     * Additional metadata specific to this server.
     *
     * @memberof NodeInfo
     */
    metadata: object;
}

/**
 * Metadata about the software this server uses.
 *
 * @class NodeInfoSoftware
 */
interface Software {
    /**
     * The canonical name of this server software.
     *
     * @memberof Software
     */
    name: string;

    /**
     * The version of this server's software
     *
     * @memberof Software
     */
    version: string;
}

/**
 * Protocols this server supports. At the moment, this is only ActivityPub.
 *
 * @type Protocol
 * @todo Support for other protocols? 
 */
type Protocol = string;

/**
 * Third-party services this server can retrieve messages from.
 * 
 * Themis isn't intended to connect to other services, but that may change.
 * Note that NodeInfo doesn't allow for NNTP, so we don't list it here.
 * 
 * @type InboundServices
 */
type InboundServices = string;

/**
 * Third-party services this server can publish messages to on behalf of a user.
 * 
 * Themis doesn't do this; its federation support is intended to be
 * of a different nature. So we'll leave this as a simple string for now.
 * 
 * @type OutboundServices
 */
type OutboundServices = string;

/**
 * Usage statistics for the server.
 *
 * @class UsageStats
 */
interface UsageStats {
    /**
     * Statistics about this server's users.
     *
     * @memberof UsageStats
     */
    users: {
        total: number;
        activeHalfYear: number;
        activeMonth: number;
    };

    /**
     * The number of posts made by users registered on this server.
     *
     * @memberof UsageStats
     */
    localPosts: number;

    /**
     * The number of comments made by users registered on this server.
     * Note that Themis doesn't use this value, but we include it here
     * for completeness.
     *
     * @memberof UsageStats
     */
    localComments?: number;
}