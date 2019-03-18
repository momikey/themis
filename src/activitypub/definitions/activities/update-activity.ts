/**
 * An Update activity taht can be used for post editing.
 * The actor must be the original poster, and the object
 * may contain any fields to be updated. Those with a value
 * of `null` will be deleted from the object.
 *
 * @export
 * @class UpdateActivity
 */
export class UpdateActivity {
    '@context': string | object | Array<string | object>;
    type: 'Update';

    /**
     * The object (usually a post) being updated. Note that
     * this *must* be an object, not a URI, because it will
     * contain new information.
     *
     * @memberof UpdateActivity
     */
    object: {[key: string]: any};

    /**
     * The actor (i.e., poster) updating the object.
     *
     * @memberof UpdateActivity
     */
    actor: string | object;

    [key: string]: any;
}