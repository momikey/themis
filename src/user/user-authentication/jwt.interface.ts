/**
 * The interface for the JWT payload.
 * Nothing special, just a username and email address.
 * These will be signed by the authentication service
 * to create a session token.
 *
 * @export
 * @interface JwtPayload
 */
export interface JwtPayload {
    username: string;
    email: string;
}