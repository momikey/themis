/**
 * The minimum structure of an ActivityPub actor object representing
 * a Themis group.
 *
 * @export
 * @class GroupActor
 */
export class GroupActor {
    readonly '@context': string | Array<string>;
    readonly id: string;
    readonly type: string;
    readonly preferredUsername: string;
    readonly inbox: string;
    readonly outbox: string;
}