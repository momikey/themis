import { Actor } from "../activitypub/definitions/actor.interface";

/**
 * A "global" post is one which can be addressed to any group
 * on any server. To do this, however requires us to keep track
 * of the addresses of all groups. Thus, it's not the same as
 * the basic CreatePostDto
 *
 * @export
 * @class CreateGlobalPostDto
 */
export class CreateGlobalPostDto {
    /**
     * The name/server of the sending actor, which can be
     * either a group or user.
     *
     * @memberof CreateGlobalPostDto
     */
    readonly sender: Actor;

    /**
     * The subject of the post.
     *
     * @memberof CreateGlobalPostDto
     */
    readonly subject: string;

    /**
     * The URI of the parent post. If not present, then
     * this is a "top-level" post.
     *
     * @memberof CreateGlobalPostDto
     */
    readonly parent?: string | undefined;

    /**
     * The groups to which this post will be sent. This
     * can be any number, but the first is considered "primary".
     *
     * @memberof CreateGlobalPostDto
     */
    readonly groups: Actor[];

    /**
     * The body of the post, in either plain text or HTML.
     *
     * @memberof CreateGlobalPostDto
     */
    readonly content: string;

    /**
     * If present, the original source of the post, in Markdown
     * or possibly another format we may add later.
     *
     * @memberof CreateGlobalPostDto
     */
    readonly source?: string | undefined;
}
