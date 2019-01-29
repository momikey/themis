import { BaseFilter, FilterEntry } from "./base-filter";
import { Post } from "../post/post.entity";

// The allowed properties to filter on. This is a different
// set for posts, because they have different content. Filtering
// on sender and group are non-trivial, owing to the fact that
// they are represented as DB relations. We'll worry about them
// at a later date.
export type FilterProperty = 'server' | 'subject' | 'content';

export class PostFilterEntry implements FilterEntry {
    // The property to filter on can be any of those above.
    // As stated, sender and groups are harder to do.
    // The other fields (ID, timestamp, etc.) aren't as helpful.
    property: FilterProperty;

    // The relation operator to use.
    // At the moment, allowed values are:
    // 'equals', 'doesNotEqual', 'contains', 'startsWith', 'endsWith', 'regExp'
    // We may add more later, which is why this is a general string.
    relation: string;

    // Value this filter will be matched against.
    // We can use either bare strings or regexes. The latter only work
    // with the "matches" filter, but we can work around that.
    target: string | RegExp;
}

export class PostFilter extends BaseFilter<Post, PostFilterEntry> {

}