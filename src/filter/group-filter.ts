import { Injectable } from '@nestjs/common';
import { Group } from '../group/group.entity';
import { FilterFunction } from './simple-filter';

// Definition for a specific entry in the list of group filters to be executed.
export class GroupFilterEntry {
    // The property of the group can be any of these.
    // Other fields don't really work. Creation dates aren't shown,
    // while filtering the list of posts based on the list of posts
    // makes no sense.
    property: 'name' |  'server' | 'displayName' | 'summary';

    // The relation operator to use.
    // At the moment, allowed values are:
    // 'equals', 'doesNotEqual', 'contains', 'startsWith', 'endsWith'
    // We may add more later, which is why this is a general string.
    relation: string;

    // Value this filter will be matched against.
    // We can use either bare strings or regexes. The latter only work
    // with the "matches" filter, but we can work around that.
    target: string | RegExp;
}


export class GroupFilter {
    constructor(private entries: GroupFilterEntry[]) {

    }

    execute(groupList: Group[]): Group[] {
        // TODO: Lots of map/reduce/filter stuff
        return groupList;
    }

    filterFromEntry(entry: GroupFilterEntry): FilterFunction<Group> {
        // TODO: create a filter function
        return (v) => true;
    }
}
