import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../entities/post.entity';
import { UserModule } from '..//user/user.module';
import { GroupModule } from '../group/group.module';

/**
 * This module does all the work for Themis posts, at least
 * as they are stored in the DB and accessed by the primary
 * frontend. ActivityPub is handled elsewhere.
 *
 * @export
 * @class PostModule
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    UserModule,
    GroupModule
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService]
})
export class PostModule {}
