/**
 * The minimum structure for an ActivityPub actor representing
 * a Themis user. This can be different from a group Actor,
 * which is why we have a separate type definition for it.
 *
 * @export
 * @class UserActor
 */
export class UserActor {
    readonly '@context': string | Array<string>;
    readonly id: string;
    readonly type: 'Person';
    readonly name: string;
    readonly preferredUsername: string;
    readonly summary: string;
    readonly icon: string;

    readonly inbox: string;
    readonly outbox: string;

    readonly followers: string;
    readonly following: string;

    // All other properties are optional.
    [key: string]: any
}