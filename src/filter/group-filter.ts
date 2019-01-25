import { Injectable } from '@nestjs/common';
import { Group } from '../group/group.entity';
import { FilterFunction, propertyFilter, equalTo, notEqualTo, contains, startsWith, endsWith, matches } from './simple-filter';

// Definition for a specific entry in the list of group filters to be executed.
export class GroupFilterEntry {
    // The property of the group can be any of these.
    // Other fields don't really work. Creation dates aren't shown,
    // while filtering the list of posts based on the list of posts
    // makes no sense.
    property: 'name' |  'server' | 'displayName' | 'summary';

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


export class GroupFilter {
    constructor(private entries: GroupFilterEntry[]) {

    }

    execute(groupList: Group[]): Group[] {
        const result = this.entries.reduce(
            (acc, fn) => acc.filter(this.filterFromEntry(fn)),
            groupList,
        );
        return result;
    }

    filterFromEntry(entry: GroupFilterEntry): FilterFunction<Group> {
        const fn = propertyFilter(entry.property, this.parseEntry(entry));
        return (v) => true;
    }

    private parseEntry(entry: GroupFilterEntry): FilterFunction<string> {
        let fn: FilterFunction<string>;

        switch (entry.relation) {
            case 'equals':
                fn = equalTo(entry.target);
                break;
        
            case 'doesNotEqual':
                fn = notEqualTo(entry.target);
                break;
            
            case 'contains':
                if (typeof entry.target === 'string') {
                    fn = contains(entry.target);
                } else {
                    throw new Error('Unable to create filter');
                }
                break;
            
            case 'startsWith':
                if (typeof entry.target === 'string') {
                    fn = startsWith(entry.target);
                } else {
                    throw new Error('Unable to create filter');
                }
                break;

            case 'endsWith':
                if (typeof entry.target === 'string') {
                    fn = endsWith(entry.target);
                } else {
                    throw new Error('Unable to create filter');
                }
                break;

            case 'regExp':
                if (typeof entry.target !== 'string') {
                    fn = matches(entry.target);
                } else {
                    throw new Error('Unable to create filter');
                }
                break;

            default:
                throw new Error(`Invalid filter relation ${entry.relation}`);
        }

        return fn;
    }
}
