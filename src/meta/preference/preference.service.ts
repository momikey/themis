import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Preference } from '../../entities/preference.entity';

/**
 * Preferences are simple key-value pairs that we'll use
 * for user settings, admin settings, and the like.
 *
 * @export
 * @class PreferenceService
 */
@Injectable()
export class PreferenceService {
    constructor(
        @InjectRepository(Preference)
        private readonly preferenceRepository: Repository<Preference>
    ) {}

    /**
     * Get a preference value, given its key.
     *
     * @param name The key string for the preference
     * @returns The preference's value, if it exists
     * @memberof PreferenceService
     */
    async getPreference(name: string): Promise<string> {
        const pref = await this.preferenceRepository.findOne({name: name});

        if (pref) {
            return pref.value;
        } else {
            return Promise.reject(`Preference ${name} does not exist`);
        }
    }

    /**
     * Set a preference to a given value
     *
     * @param name The key string for the preference
     * @param newValue The new value for the preference
     * @returns An object representing the new preference
     * @memberof PreferenceService
     */
    async setPrefercne(name: string, newValue: string): Promise<Preference> {
        const newPref = {
            name: name,
            value: newValue
        };

        return this.preferenceRepository.save(newPref);
    }
}
