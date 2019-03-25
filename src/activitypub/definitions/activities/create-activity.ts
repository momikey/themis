import { PostObject } from "./post-object";
import { User } from "../../../entities/user.entity";
import { AP } from "../constants";
import { getActorUri, getIdForActor, ActorType } from "../actor.interface";

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
    object: PostObject;
    published: string;
    to: string[];

    [key: string]: any;
}

/**
 * Create a new Create activity from a bare object,
 * as per ActivityPub spec 6.2.1. We won't add the ID here,
 * since that requires actually committing the post to the DB.
 *
 * @param asObject An object representing a post
 * @returns A new Create activity that wraps the object
 * @memberof ActivityService
 */
export function activityFromObject(asObject: PostObject, sender?: User): CreateActivity {
    const from: string = asObject.attributedTo || (sender && getIdForActor(sender, ActorType.User));

    const created: CreateActivity = {
        '@context': AP.Context,
        type: 'Create',
        actor: from,
        to: asObject.to || [],
        cc: asObject.cc || [],
        bto: asObject.bto || [],
        bcc: asObject.bcc || [],
        audience: asObject.audience || [],
        published: asObject.published || new Date().toJSON(),

        id: '',

        object: asObject
    };

    return created;
}