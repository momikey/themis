/**
 * DTO to create a new account on this server. The fields
 * should be self-explanatory.
 *
 * @export
 * @class CreateAccountDto
 */
export class CreateAccountDto {
    readonly username: string;
    readonly email: string;
    readonly password: string;
}