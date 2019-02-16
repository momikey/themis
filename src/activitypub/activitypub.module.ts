import { Module, HttpModule } from '@nestjs/common';
import { ApgroupController } from './apgroup/apgroup.controller';
import { ApgroupService } from './apgroup/apgroup.service';
import { GroupActorHelper } from './group-actor.helper';
import { InboxOutboxController } from './inbox-outbox/inbox-outbox.controller';
import { NodeinfoController } from './nodeinfo/nodeinfo.controller';
import { UserModule } from 'src/user/user.module';
import { PostModule } from 'src/post/post.module';

@Module({
  imports: [HttpModule, UserModule, PostModule],
  controllers: [ApgroupController, InboxOutboxController, NodeinfoController],
  providers: [ApgroupService, GroupActorHelper]
})
export class ActivitypubModule {}
