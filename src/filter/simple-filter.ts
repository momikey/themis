/*
    A group of very simple filters underlying the Themis system.
    Each filter is actually a higher-order function that creates
    functions that can be passed to Array.filter.
*/

export class SimpleFilter {}

// All filters create a  generic function, taking an object of
//  a specific type and returning a boolean that indicates whether
//  the value meets the filter's criteria. 
export type FilterFunction<T> = (value: T) => boolean;

/* Unary filter functions: these require only a single value. */

// The simplest filter: always reeturns true, no matter what is passed.
export function all<T>(): FilterFunction<T> {
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