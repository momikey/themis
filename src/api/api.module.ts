import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { AuthenticationController } from './authentication/authentication.controller';
import { GroupController } from './group/group.controller';
import { GroupModule } from '../group/group.module';

@Module({
  controllers: [ApiController, AuthenticationController, GroupController],
  imports: [
    GroupModule
  ]
})
export class ApiModule {}
