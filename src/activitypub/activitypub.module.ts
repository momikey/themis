import { Module, HttpModule } from '@nestjs/common';
import { ApgroupController } from './apgroup/apgroup.controller';
import { ApgroupService } from './apgroup/apgroup.service';
import { GroupActorHelper } from './group-actor.helper';

@Module({
  imports: [HttpModule],
  controllers: [ApgroupController],
  providers: [ApgroupService, GroupActorHelper]
})
export class ActivitypubModule {}
