// This is the minimial data structure needed to create a local user record.
// As with the Group DTO, it's not the same as the AP version, but we can
// create the additional properties for an Actor object as needed.

export class CreateUserDto {
    readonly name: string;
    readonly server: string;
    readonly displayName: string;
    readonly summary: string;
    readonly iconUrl: string;
    readonly uri?: string;
}