// These are all the basic attributes needed for a group as an AP actor.
// Thus, this object defines the minimum interface necessary to interact.

export class GroupActor {
    readonly "@context": string | Array<string>;
    readonly id: string;
    readonly type: string;
    readonly preferredUsername: string;
    readonly inbox: string;
    readonly outbox: string;
}