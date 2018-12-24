import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { PostModule } from 'src/post/post.module';
import { UserAuthenticationService } from './user-authentication/user-authentication.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserAuthenticationController } from './user-authentication/user-authentication.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      // TODO: change these for production
      secretOrPrivateKey: 'secretKey',
      signOptions: {
        expiresIn: 3600
      }
    })
  ],
  providers: [UserService, UserAuthenticationService],
  controllers: [UserController, UserAuthenticationController],
  exports: [UserService]
})
export class UserModule {}
