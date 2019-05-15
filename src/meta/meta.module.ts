import { Module, Global } from '@nestjs/common';
import { PreferenceService } from './preference/preference.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Preference } from '../entities/preference.entity';

/**
 * The meta module holds anything that doesn't really fit
 * in other modules, as well as server-specific settings.
 *
 * @export
 * @class MetaModule
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Preference])],
  providers: [PreferenceService]
})
export class MetaModule {}
