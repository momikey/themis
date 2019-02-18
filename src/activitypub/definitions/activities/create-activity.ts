/**
 * An ActivityPub Create activity object, used for posts
 * and potentially other things.
 * 
 * Note that the AP spec requires servers to implement handling
 * of bare objects, which must be wrapped in a Create activity.
 * 
 * Also, activity properties are not marked read-only, as we did
 * for Actor types. This is because some actions may require
 * changing values.
 *
 * @export
 * @class CreateActivity
 */
export class CreateActivity {
    '@context': string | object | Array<string | object>;
    id: string;
    type: 'Create';
    actor: string | object;
    object: CreateObject;
    published: string;
    to: string[];

    [key: string]: any;
}

/**
 * An object to be attached to a Create activity.
 * 
 * As stated above, clients can send these bare, and it's up to us
 * to wrap them in the activity.
 * 
 *
 * @export
 * @class CreateObject
 */
export class CreateObject {
    '@context': string | Array<string>;
    id: string;

    // Themis posts will be of type "Article", but we may need others
    type: string;

    // The sender of the post
    attributedTo: string | Array<object | string>;

    // The parent of this post; if absent, then this is a top-level post
    inReplyTo?: string | object;

    // The post's subject (AP defines a "subject" property, but
    // only for Relationships)
    summary: string;

    // The post text
    content: string;

    [key: string]: any;
}