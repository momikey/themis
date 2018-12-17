import { Module, Global } from '@nestjs/common';
import { PreferenceService } from './preference/preference.service';

@Global()
@Module({
  providers: [PreferenceService]
})
export class MetaModule {}
