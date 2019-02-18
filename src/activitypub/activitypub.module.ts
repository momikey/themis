import { Module, HttpModule } from '@nestjs/common';
import { NodeinfoController } from './nodeinfo/nodeinfo.controller';
import { UserModule } from 'src/user/user.module';
import { PostModule } from 'src/post/post.module';
import { ApGroupService } from './ap-group/ap-group.service';
import { ApUserService } from './ap-user/ap-user.service';

@Module({
  imports: [HttpModule, UserModule, PostModule],
  controllers: [NodeinfoController],
  providers: [ApGroupService, ApUserService]
})
export class ActivityPubModule {}
