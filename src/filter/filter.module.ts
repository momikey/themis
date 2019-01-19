import { Module, Global } from '@nestjs/common';
import { GroupFilter } from './group-filter';
import { UserFilter } from './user-filter';
import { PostFilter } from './post-filter';

@Global()
@Module({
  providers: [GroupFilter, UserFilter, PostFilter]
})
export class FilterModule {}
