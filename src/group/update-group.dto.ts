// This is all the data needed to *update* a group entity.
// It's different from the Create DTO because an existing group
// will have a database ID already, along with a date, etc.
// Note that we don't care about the posts of a group. (That's
// strictly a DB thing, though we may have to account for it.)

export class UpdateGroupDto {
    readonly id: number;
    readonly name: string;
    readonly server: string;
    readonly displayName: string;
    readonly summary: string;
    readonly date: string;
}