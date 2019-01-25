/*
    A group of very simple filters underlying the Themis system.
    Each filter is actually a higher-order function that creates
    functions that can be passed to Array.filter.
*/

// All filters create a  generic function, taking an object of
//  a specific type and returning a boolean that indicates whether
//  the value meets the filter's criteria. 
export type FilterFunction<T> = (value: T) => boolean;

/* Unary filter functions: these require only a single value. */

// The simplest filter: always reeturns true, no matter what is passed.
export function always<T>(): FilterFunction<T> {
    return (v) => true;
}

// The inverse of `all`: always returns false.
export function never<T>(): FilterFunction<T> {
    return (v) => false;
}

// Accept only a defined value.
export function defined<T>(): FilterFunction<T> {
    return (v) => v !== undefined;
}

// Accept only a truthy value.
export function truthy<T>(): FilterFunction<T> {
    return (v) => !!v;
}

/*
    Binary filter functions: these take two values, using the second
    in some way to determine whether to accept or reject the first.
    The filter creators here only need the predicate value.
*/

// Accepts only inputs that equal a given value.
export function equalTo<T>(predicate: T): FilterFunction<T> {
    return (v) => v === predicate;
}

// The inverse of the above: accepts inputs that do not equal that given.
export function notEqualTo<T>(predicate: T): FilterFunction<T> {
    return (v) => v !== predicate;
}

// Accepts only inputs that have a specific property, given as a string.
export function hasProperty<T extends object>(predicate: string): FilterFunction<T> {
    return (v) => v instanceof Object && predicate in v;
}

/*
    Number comparison filters: these operate only on numbers, so they
    are not generic, but instead return FilterFunction<number>. All
    take a target value taht works the same as the binary functions above.
*/

// Accpets only numerical inputs that are greater than that given.
export function greaterThan(target: number): FilterFunction<number> {
    return (v) => v > target;
}

// Accepts only numerical inputs that are less than that given.
export function lessThan(target: number): FilterFunction<number> {
    return (v) => v < target;
}

/*
    String filters: these operate only on strings (obviously), and
    most of them don't really need any complicated regex stuff.
*/

// Accepts only inputs that contain a given substring.
export function includes(substring: string): FilterFunction<string> {
    return (v) => v.includes(substring);
}

// Synonym for "includes". The ECMAScript standard uses the "includes",
// but "Contains" more closely matches expectations, IMO.
export { includes as contains };

// Accepts only inputs that match a regex.
export function matches(re: RegExp): FilterFunction<string> {
    return (v) => re.test(v);
}

// Accepts inputs that start with a given substring.
export function startsWith(substring: string): FilterFunction<string> {
    return (v) => v.startsWith(substring);
}

// Accepts inputs that end with a given substring
export function endsWith(substring: string): FilterFunction<string>{
    return (v) => v.endsWith(substring);
}

/*
    Helper functions
*/

// Adapts a filter function to operate on a property of an object.
export function propertyFilter<T>(prop: string, func: FilterFunction<T>) : FilterFunction<object> {
    return (obj: object) => {
        if (!(prop in obj)) {
            throw new Error(`Object does not have property ${prop}`);
        }

        return func(obj[prop]);
    }
}