import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { PostModule } from 'src/post/post.module';
import { UserAuthenticationService } from './user-authentication/user-authentication.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UserService, UserAuthenticationService],
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule {}
