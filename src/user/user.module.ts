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
import { UserAuthentication } from './user-authentication/user-authentication.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserAuthentication]),
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
  exports: [UserService, UserAuthenticationService]
})
export class UserModule {}
