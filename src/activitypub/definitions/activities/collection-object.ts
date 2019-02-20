/**
 * Interface for an ActivityStreams collection, as used in
 * inbox/outbox retrieval. Typing is tricky here, because
 * there are a lot of different possibilities. Thus, we'll
 * keep this object as aore of a rough outline.
 *
 * @export
 * @class Collection
 */
export class Collection {
    '@context': string;

    type: 'Collection' | 'OrderedCollection';

    totalItems: number;

    items?: any[];
    orderedItems?: any[];

    [key: string]: any;
}