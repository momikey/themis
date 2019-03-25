import { Group } from '../entities/group.entity';
import { BaseFilter, FilterEntry } from './base-filter';

// These are the properties of a Group entity that we can filter on.
export type FilterProperty = 'name' |  'server' | 'displayName' | 'summary';

// Definition for a specific entry in the list of group filters to be executed.
export class GroupFilterEntry implements FilterEntry {
    // The property of the group can be any of these.
    // Other fields don't really work. Creation dates aren't shown,
    // while filtering the list of posts based on the list of posts
    // makes no sense.
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

export class GroupFilter extends BaseFilter<Group, GroupFilterEntry> {

}