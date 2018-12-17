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

        return pref.value;
    }

    async setPrefercne(name: string, newValue: string): Promise<Preference> {
        const newPref = {
            name: name,
            value: await this.getPreference(name)
        };

        return this.preferenceRepository.save(newPref);
    }
}
