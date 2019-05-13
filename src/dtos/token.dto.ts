/**
 * This is a simple type object to describe a login or API token.
 *
 * @export
 * @class TokenDto
 */
export class TokenDto {
    // Tokens have an expiration time, after which the user/service
    // will need to relog or otherwise contact the server for access.
    readonly expiresIn: number;

    // The access token is signed, and its internal structure
    // is left opaque. Internally, it's a JWT token or something similar.
    readonly accessToken: string;
}