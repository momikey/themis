import { Module, HttpModule } from '@nestjs/common';
import { ApgroupController } from './apgroup/apgroup.controller';
import { ApgroupService } from './apgroup/apgroup.service';
import { NodeinfoController } from './nodeinfo/nodeinfo.controller';
import { UserModule } from 'src/user/user.module';
import { PostModule } from 'src/post/post.module';

@Module({
  imports: [HttpModule, UserModule, PostModule],
  controllers: [ApgroupController, NodeinfoController],
  providers: [ApgroupService]
})
export class ActivitypubModule {}
