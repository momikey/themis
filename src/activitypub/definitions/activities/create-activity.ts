import { PostObject } from "./post-object";

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
