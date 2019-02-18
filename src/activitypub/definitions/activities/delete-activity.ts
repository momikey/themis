/**
 * A Delete activity, used for deleting posts.
 * 
 * By design, Themis doesn't offer much room for post deletion.
 * However, users will be allowed to remove their own posts, and
 * a client could offer, for example, inline access for admins.
 * As well, this activity can be used to represent deletion of
 * users and groups.
 * 
 * Deleted objects will be replaced by a Tombstone that shows
 * the date of deletion and reason.
 * 
 * Also, in a slight change to what the ActivityPub spec requests,
 * deleted objects will be sent with one of two HTTP status codes:
 * - 410 Gone (typical, when deleted by poster, etc.)
 * - 451 Unavailable For Legal Reasons (self-explanatory)
 *
 * @export
 * @class DeleteActivity
 */
export class DeleteActivity {
    '@context': string | object | Array<string | object>;
    type: 'Delete';

    // The object (i.e., post) that is being deleted
    object: string;

    // The actor performing the deletion, which must be either
    // the original poster or an admin
    actor: string | object;

    // The reason for deletion, which is *required*
    summary: string;

    [key: string]: any;
}