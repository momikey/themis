import { BaseFilter, FilterEntry } from "./base-filter";
import { User } from "../user/user.entity";

// Valid properties for user filters.
// We may add others later on, which is why we're not just
// reusing the type from the group-filter module.
export type FilterProperty = 'name' | 'server' | 'displayName' | 'summary';

// Definition for a specific entry in the user filter list.
export class UserFilterEntry implements FilterEntry {
    // The property this entry filters on can be any of those listed above.
    // Note that the same caveats apply here as for groups.
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

// Since we impplemented all the logic in BaseFilter,
// there's nothing much to do here at the moment.
export class UserFilter extends BaseFilter<User, UserFilterEntry> {

}
