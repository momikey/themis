import { Module, HttpModule } from '@nestjs/common';
import { NodeinfoController } from './nodeinfo/nodeinfo.controller';
import { UserModule } from 'src/user/user.module';
import { PostModule } from 'src/post/post.module';
import { ApGroupService } from './ap-group/ap-group.service';
import { ApUserService } from './ap-user/ap-user.service';
import { ActivityService } from './activity/activity.service';
import { GroupModule } from 'src/group/group.module';
import { ApGroupController } from './ap-group/ap-group.controller';
import { ApUserController } from './ap-user/ap-user.controller';
import { ApPostController } from './ap-post/ap-post.controller';
import { ApPostService } from './ap-post/ap-post.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from '../entities/activity.entity';
import { ActivityController } from './activity/activity.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Activity]),
    HttpModule,
    UserModule,
    PostModule,
    GroupModule
  ],
  controllers: [NodeinfoController, ApGroupController, ApUserController, ApPostController, ActivityController],
  providers: [ApGroupService, ApUserService, ActivityService, ApPostService]
})
export class ActivityPubModule {}
