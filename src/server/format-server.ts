
/**
 * This function formats the host and port portions of a server,
 * for use in addresses and Webfinger-like situtations.
 * Scheme is ignored.
 *
 * @export
 * @param server A database entity representing the server
 */
export function formatServer(server: ServerParts) {
    const portPart = (server.port) ? `:${server.port}` : '';
    return `${server.host}${portPart}`;
}

interface ServerParts {
    host: string;
    port: number | string;
}