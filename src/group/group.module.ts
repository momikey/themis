import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from '../entities/group.entity';

/**
 * This module handles all the internal group details.
 * This isn't the interface we present to ActivityPub,
 * but the layer that interacts with the database.
 *
 * @export
 * @class GroupModule
 */
@Module({
  imports: [TypeOrmModule.forFeature([Group])],
  providers: [GroupService],
  controllers: [GroupController],
  exports: [GroupService]
})
export class GroupModule {}
