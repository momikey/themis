import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { UserModule } from './user/user.module';
import { GroupModule } from './group/group.module';
import { PostModule } from './post/post.module';
import { ActivitypubModule } from './activitypub/activitypub.module';
import { ConfigModule } from './config/config.module';
import { MetaModule } from './meta/meta.module';
import { FilterModule } from './filter/filter.module';

@Module({
  imports: [TypeOrmModule.forRoot(), UserModule, GroupModule, PostModule, ActivitypubModule, ConfigModule, MetaModule, FilterModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private readonly connection: Connection) {}
}
