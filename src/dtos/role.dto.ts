import { UserRole } from "../user/user-authentication/user-authentication.role";

/**
 * The DTO for a user role. These are needed if we change
 * the role of a user (e.g., promoting to admin). In theory,
 * this could also be used for temp banning; we'll have to
 * look into that.
 *
 * @export
 * @class RoleDto
 */
export class RoleDto {
    readonly username: string;
    readonly newRole: UserRole;
}