import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { UserModule } from './user/user.module';
import { GroupModule } from './group/group.module';
import { PostModule } from './post/post.module';

@Module({
  imports: [TypeOrmModule.forRoot(), UserModule, GroupModule, PostModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private readonly connection: Connection) {}
}
