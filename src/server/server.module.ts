import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Server } from './server.entity';
import { ServerService } from './server.service';

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([Server])
    ],
    providers: [ServerService],
    exports: [ServerService]
})
export class ServerModule {}