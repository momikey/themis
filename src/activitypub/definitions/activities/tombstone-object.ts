/**
 * A Tombstone is used to represent deleted posts.
 *
 * @export
 * @class TombstoneObject
 */
export class TombstoneObject {
    '@context': string;
    type: 'Tombstone';

    /**
     * The identifying URI for the object (or its remains)
     *
     * @memberof TombstoneObject
     */
    id: string;

    /**
     * The former type of the deleted object. (Article for posts)
     *
     * @memberof TombstoneObject
     */
    formerType?: string;

    /**
     * A timestamp to indicate time of deletion.
     * We don't use this yet, but there's nothing stopping us
     * from adding it later on. And other platforms might use it.
     *
     * @memberof TombstoneObject
     */
    deleted?: string;

    /**
     * The reason why this object was deleted.
     * As Themis is intended to be censorship-resistant, all
     * deletions *must* have a reason. If this is because of
     * a legal action such as a court order, we will return
     * the special HTTP status code 451 for any access, because
     * users should know this.
     *
     * @memberof TombstoneObject
     */
    reason: string;

    [key: string]: any;
}