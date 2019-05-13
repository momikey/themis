/**
 * DTO to update a user's profile information. At the moment,
 * there's not much of that, but we may add more later. Except
 * for the name of the user, all fields are optional, because
 * some may not need to be updated.
 *
 * @export
 * @class UpdateUserDto
 */
export class UpdateUserDto {
    readonly name: string;
    readonly displayName?: string;
    readonly summary?: string;
    readonly icon?: string;
}