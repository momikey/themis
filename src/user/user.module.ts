import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { PostModule } from 'src/post/post.module';
import { UserAuthenticationService } from './user-authentication/user-authentication.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserAuthenticationController } from './user-authentication/user-authentication.controller';
import { Account } from './user-authentication/account.entity';
import { JwtStrategy } from './user-authentication/jwt.strategy';
import passport = require('passport');
import { LocalStrategy } from './user-authentication/local.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Account]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      // TODO: change these for production
      secretOrPrivateKey: 'secretKey',
      signOptions: {
        expiresIn: 3600 * 24
      }
    })
  ],
  providers: [UserService, UserAuthenticationService, JwtStrategy, LocalStrategy],
  controllers: [UserController, UserAuthenticationController],
  exports: [UserService, UserAuthenticationService]
})
export class UserModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
      consumer
        .apply(passport.authenticate('jwt', {
          session: false,
          // successRedirect: '/web',
        }))
        .forRoutes('internal/authenticate/post-login');
    }
}
