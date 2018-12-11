import { Module, HttpModule } from '@nestjs/common';
import { ApgroupController } from './apgroup/apgroup.controller';
import { ApgroupService } from './apgroup/apgroup.service';
import { GroupActorHelper } from './group-actor.helper';
import { InboxOutboxController } from './inbox-outbox/inbox-outbox.controller';

@Module({
  imports: [HttpModule],
  controllers: [ApgroupController, InboxOutboxController],
  providers: [ApgroupService, GroupActorHelper]
})
export class ActivitypubModule {}
