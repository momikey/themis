/**
 * Interface for an ActivityStreams collection, as used in
 * inbox/outbox retrieval. Typing is tricky here, because
 * there are a lot of different possibilities. Thus, we'll
 * keep this object as aore of a rough outline.
 * 
 * The `items` and `orderedItems` properties are mutually
 * exclusive; the latter is used only for OrderedCollections.
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

/**
 * Interface for a single page of a paged collection.
 * Note that links to previous and next aren't required.
 *
 * @export
 * @class CollectionPage
 */
export class CollectionPage {
    '@context': string;

    type: 'CollectionPage' | 'OrderedCollectionPage';

    partOf: string;

    items?: any[];
    orderedItems?: any[];

    prev?: string;
    next?: string;

    [key: string]: any;
}