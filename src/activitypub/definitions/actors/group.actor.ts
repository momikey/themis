/**
 * The minimum structure of an ActivityPub actor object representing
 * a Themis group.
 *
 * @export
 * @class GroupActor
 */
export class GroupActor {
    readonly '@context': string | object | Array<string | object>;
    readonly id: string;
    readonly type: 'Group';
    readonly name: string;
    readonly preferredUsername: string;
    readonly inbox: string;
    readonly outbox: string;

    // Groups don't actually follow anyone, but they can *be* followed.
    readonly followers: string;
    readonly following: string;

    // All other properties are optional.
    [key: string]: any
}
