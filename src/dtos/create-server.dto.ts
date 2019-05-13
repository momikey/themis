/**
 * Create a new server entry for the database. Except for ours,
 * which should be obvious, these are only made as needed, For a
 * non-federated server, that'll be never.
 *
 * @export
 * @class CreateServerDto
 */
export class CreateServerDto {
    readonly host: string;
    readonly scheme: string;
    readonly port: number;
}