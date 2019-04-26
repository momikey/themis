// This is all that's needed to create a new group from a form (e.g., admin)
// Note that it's a lot different from the AP Actor object

export class CreateGroupDto {
    readonly name: string;
    readonly server?: string;
    readonly displayName: string;
    readonly summary?: string;
    readonly uri?: string;
}