import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { AuthenticationController } from './authentication/authentication.controller';
import { GroupController } from './group/group.controller';
import { GroupModule } from '../group/group.module';
import { UserModule } from '../user/user.module';
import { UserController } from './user/user.controller';
import { PostController } from './post/post.controller';
import { PostModule } from '../post/post.module';

@Module({
  controllers: [ApiController, AuthenticationController, GroupController, UserController, PostController],
  imports: [
    GroupModule,
    UserModule,
    PostModule
  ]
})
export class ApiModule {}
