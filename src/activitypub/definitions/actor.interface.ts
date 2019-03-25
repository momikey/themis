import * as URI from 'uri-js';
import { User } from 'src/entities/user.entity';
import { Group } from 'src/entities/group.entity';
import { Server } from '../../entities/server.entity';

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
    readonly port?: number;
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
            server: parsed.host,
            port: +parsed.port
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

/**
 * Parse a list of actor URIs into objects
 *
 * @param targets An array of URIs representing actors
 * @param desiredType The type of actor: group or user
 * @returns Actor objects for every actor of the given type in the list
 */
export function parseActor(targets: string[], desiredType: ActorType): Actor[] {
    return targets.map((t) => {
        const parsed = fromUri(t);
        return (parsed.type === desiredType) ? parsed.actor : undefined
    }).filter((e) => e != undefined);
}

/**
 * Extract a URI from an actor reference. These can be in
 * various forms (URI, array, or object), so we have to
 * compensate for that.
 *
 * @param actor A reference to an actor
 * @returns The URI for that actor
 */
export function getActorUri(actor: string | (string | object)[]): string {
    // TODO: Better handling fo this
    if (typeof actor == 'string') {
        return actor;
    } else if (typeof actor[0] == 'string') {
        return actor[0] as string;
    } else {
        return actor[0]['id'];
    }
}

/**
 * Get the URI for a user or group, for use as the ID
 * in Activities.
 *
 * @export
 * @param actor The user or group
 * @param type The type of actor
 * @returns A unique URI for the user or group
 */
export function getIdForActor(actor: User | Group, type: ActorType): string {
    if (actor.uri) {
        return actor.uri;
    } else {
        const t = ActorType[type].toLowerCase();
        const uri = URI.serialize({
            host: actor.server.host,
            scheme: actor.server.scheme,
            port: actor.server.port,
            path: `${t}/${actor.name}`
        });

        return URI.normalize(uri);
    }
}
