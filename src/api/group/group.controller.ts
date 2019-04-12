import { Controller, Get, Query } from '@nestjs/common';
import { GroupService } from '../../group/group.service';
import { Group } from '../../entities/group.entity';

/**
 * API endpoints for groups. This does not include ActivityPub.
 * Instead, these work directly with the DB.
 *
 * @export
 * @class GroupController
 */
@Controller('api/v1/group')
export class GroupController {
    constructor(
        private readonly groupService: GroupService
    ) {}

    @Get('list')
    getGroupList(@Query('sort') sortBy? : string, @Query('desc') descending? : boolean): Promise<Group[]> {
        switch (sortBy) {
            case 'date':
            case 'name':
            case 'server':
                return this.groupService.findAllSorted(sortBy, descending || false);
            default:
                return this.groupService.findAll();
        }
    }
}
