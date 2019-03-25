import { Module, Global } from '@nestjs/common';
import { PreferenceService } from './preference/preference.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Preference } from '../entities/preference.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Preference])],
  providers: [PreferenceService]
})
export class MetaModule {}
