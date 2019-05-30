import { PostObject } from "./post-object";

/**
 * Basic structure of a Like activity. Likes are inherently
 * transient, IMO, and the AP spec allows transient activities
 * to ignore the ID requirement. The actor and object are
 * required, though I don't know if the object should be an
 * actual object or just a URI. (Themis uses the latter.)
 *
 * @export
 * @class LikeActivity
 */
export class LikeActivity {
    '@context': string | object | Array<string | object>;
    type: 'Like';
    actor: string | object;
    object: string;

    [key: string]: any;
}