import { Module } from '@nestjs/common';
import { PreferenceService } from './preference/preference.service';

@Module({
  providers: [PreferenceService]
})
export class MetaModule {}
