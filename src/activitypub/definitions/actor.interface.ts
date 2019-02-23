import * as URI from 'uri-js';

/**
 * An actor can be any sender or recipient. They're identified
 * using two pieces of information: their username and their
 * originating server. This pattern is common enough that it helps
 * to define an interface for it.
 *
 * @export
 * @interface Actor
 */
export interface Actor {
    readonly name: string;
    readonly server: string;
}

/**
 * Functions that parse a URI to get actor info need to inform
 * their callers of the type of the actor: group or user.
 *
 * @export
 * @enum {number}
 */
export enum ActorType { User, Group, Invalid };

/**
 * Extract a name/server pair from a URI. This can be either
 * a group or user
 *
 * @export
 * @param uri
 */
export function fromUri(uri: string): { actor: Actor, type: ActorType } {
    const parsed = URI.parse(uri);
    const path = parsed.path.split('/');

    const result = {
        actor: {
            name: path[path.length - 1],
            server: parsed.host
        },
        type: undefined
    };

    if (path[1] === 'user') {
        result.type = ActorType.User;
    } else if (path[1] === 'group') {
        result.type = ActorType.Group;
    } else {
        result.type = ActorType.Invalid;
    }

    return result;
}