import { FilterFunction, propertyFilter, equalTo, notEqualTo, contains, startsWith, endsWith, matches } from "./simple-filter";

// A filter entry of any type must have the following:
// * A property to filter on,
// * A filtering relation,
// * A "target" value.
// Specialized subclasses can implement their own logic,
// such as allowable property names, so this is left abstract.
export interface FilterEntry {
    property: string;
    relation: string;
    target: string | RegExp;
}

// The BaseFilter class implements all the logic needed to
// filter a collection of DB entities (or any other object).
// Each subclass can add customization where necessary, but
// this is the basic structure.
export class BaseFilter<Entity extends Object, Filter extends FilterEntry> {
    constructor(readonly entries: Filter[]) {

    }

    // Execute each filtering function in turn on the entries list.
    // The returned result will be a new collection containing only
    // those entries which satisfy all the filter conditions.
    //
    // NOTE: We invert the logic in *this* function, because of how
    // the filtering is intended to work. That is, a Themis filter
    // should block entities that satisfy the given conditions, not
    // pass them through. For the sake of readability elsewhere,
    // however, we'll restrict the logic to this one method.
    execute(entityList: Entity[]): Entity[] {
        const negate = function (fn: FilterFunction<Entity>): FilterFunction<Entity> {
            return (_) => !(fn(_));
        }
        const result = this.entries.reduce(
            (acc, fn) => acc.filter(negate(this.filterFromEntry(fn))),
            entityList,
        );
        return result;
    }

    // Create a filter function from a FilterEntry object.
    filterFromEntry(entry: Filter): FilterFunction<Entity> {
        const fn = propertyFilter(entry.property, this.parseEntry(entry));
        return fn;
    }

    // Parse a FilterEntry object. This is a non-public helper
    // only intended for use in the filterFromEntry method above.
    // It uses the "simple" filters (and maybe more advanced ones
    // one day).
    protected parseEntry(entry: Filter): FilterFunction<string> {
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
