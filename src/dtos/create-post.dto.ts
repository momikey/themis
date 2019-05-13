/**
 * This is the minimal set of data required for a Themis post.
 * Obviously, we'll add in a lot more (metadata, AP properties, etc.), but
 * the purpose of this object is to get the bare necessities into the DB,
 *
 * @export
 * @class CreatePostDto
 */
export class CreatePostDto {
    readonly sender: string;
    readonly server: string;
    readonly subject: string;
    readonly parent: string;
    readonly primaryGroup: string;
    readonly ccGroups: string[];
    readonly content: string;
    readonly source: string;
}