import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { UserModule } from './user/user.module';
import { GroupModule } from './group/group.module';
import { PostModule } from './post/post.module';
import { ActivityPubModule } from './activitypub/activitypub.module';
import { ConfigModule } from './config/config.module';
import { MetaModule } from './meta/meta.module';
import { FilterModule } from './filter/filter.module';
import { ServerModule } from './server/server.module';
import { ApiModule } from './api/api.module';

/**
 * The app module is the root of the Themis hierarchy,
 * but it doesn't do much more than contain everything else.
 *
 * @export
 * @class AppModule
 */
@Module({
  imports: [TypeOrmModule.forRoot(), UserModule, GroupModule, PostModule, ActivityPubModule, ConfigModule, MetaModule, FilterModule, ServerModule, ApiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private readonly connection: Connection) {}
}
