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
    deleted?: string

    [key: string]: any;
}