import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Server } from '../entities/server.entity';
import { ServerService } from './server.service';

/**
 * Functionality to handle server addresses is split into
 * its own module to reduce interdependency, and really
 * because there's nowhere else it fits.
 *
 * @export
 * @class ServerModule
 */
@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([Server])
    ],
    providers: [ServerService],
    exports: [ServerService]
})
export class ServerModule {}