/**
 * An object to be attached to any activity.
 *
 * Clients can send these bare, and it's up to us to wrap them
 * in a Create activity when posted.
 *
 * @export
 * @class PostObject
 */
export class PostObject {
    '@context': string | Array<string>;

    // The ID can be empty to start, since we'll wrap it later.
    id?: string;

    // Themis posts will be of type "Article", but we may need others
    type: string;

    // The sender of the post
    // TODO: Don't know if we'll need to change the type for actor handling.
    attributedTo: string;

    // The parent of this post; if absent, then this is a top-level post
    inReplyTo?: string;

    // The post's subject (AP defines a "subject" property, but
    // only for Relationships)
    summary: string;

    // The post text
    content: string;
    
    [key: string]: any;
}
