import { Entity, PrimaryColumn } from "typeorm";

// Preferences are simply that: preferences. In the database,
// we store them as key/value pairs. There's not much else to it.
// See the documentation for valid prefernce keys and their possible values.

@Entity()
export class Preference {
    // Do we actually need an ID for primary key, or will this work?
    // This way's easier, IMO, but I don't know if it has hidden problems.
    // Well, we'll see.

    // The preference's name.
    // TODO: Explain/document possible values, format (case, etc.), and all that.
    @PrimaryColumn()
    name: string;

    // The preference's value.  Note that, while there may be preferences
    // best modeled as numbers, we'll default to using strings to store them.
    value: string;
}