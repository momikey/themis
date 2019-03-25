import { UserRole } from "../user/user-authentication/user-authentication.role";

export class RoleDto {
    readonly username: string;
    readonly newRole: UserRole;
}