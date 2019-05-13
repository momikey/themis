import { Module, Global } from '@nestjs/common';
import { ConfigService } from './config.service';
import { join } from 'path';

/**
 * This module handles server-level configuration, such as
 * server host and port, DB connection, secret keys, SSL, etc.
 *
 * @export
 * @class ConfigModule
 */
@Global()
@Module({
  providers: [
    {
      provide: ConfigService,
      useValue: new ConfigService(join(__dirname, '..', '..', 'config.env'))
    },
  ],
  exports: [ConfigService]
})
export class ConfigModule {}
