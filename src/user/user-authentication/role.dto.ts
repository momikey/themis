import { UserRole } from "./user-authentication.role";

export class RoleDto {
    readonly username: string;
    readonly newRole: UserRole;
}