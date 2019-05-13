/**
 * This is the minimal set of data required for a reply post.
 * Replies must also have a parent, of course, but we look that up.
 * Another difference is that we only have one group. This may need
 * to be changed later, depending on how we want to handle crossposts.
 * We send this group by ID number instead of name, as well, since we'll
 * look it up in the DB later.
 *
 * @export
 * @class CreateReplyDto
 */
export class CreateReplyDto {
    readonly sender: string;
    readonly server: string;
    readonly subject: string;
    readonly group: number;
    readonly content: string;
    readonly source: string;
}