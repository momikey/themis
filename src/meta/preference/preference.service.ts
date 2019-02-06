import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Preference } from './preference.entity';

@Injectable()
export class PreferenceService {
    constructor(
        @InjectRepository(Preference)
        private readonly preferenceRepository: Repository<Preference>
    ) {}

    async getPreference(name: string): Promise<string> {
        const pref = await this.preferenceRepository.findOne({name: name});

        if (pref) {
            return pref.value;
        } else {
            return Promise.reject(`Preference ${name} does not exist`);
        }
    }

    async setPrefercne(name: string, newValue: string): Promise<Preference> {
        const newPref = {
            name: name,
            value: newValue
        };

        return this.preferenceRepository.save(newPref);
    }
}
