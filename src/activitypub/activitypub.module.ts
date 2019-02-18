import { Module, HttpModule } from '@nestjs/common';
import { NodeinfoController } from './nodeinfo/nodeinfo.controller';
import { UserModule } from 'src/user/user.module';
import { PostModule } from 'src/post/post.module';

@Module({
  imports: [HttpModule, UserModule, PostModule],
  controllers: [NodeinfoController],
  providers: []
})
export class ActivityPubModule {}
