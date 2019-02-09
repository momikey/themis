// This is the minimal set of data required for a top-level post.
// Top-level posts are those which have no parent.

export class CreateTopLevelPostDto {
    readonly sender: string;
    readonly server: string;
    readonly subject: string;
    readonly primaryGroup: string;
    readonly ccGroups: string[];
    readonly content: string;
    readonly source: string;
}