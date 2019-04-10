import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { AuthenticationController } from './authentication/authentication.controller';
import { GroupController } from './group/group.controller';
import { GroupModule } from '../group/group.module';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [ApiController, AuthenticationController, GroupController],
  imports: [
    GroupModule,
    UserModule
  ]
})
export class ApiModule {}
