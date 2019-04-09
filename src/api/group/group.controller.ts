import { Controller, Get } from '@nestjs/common';
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
    getGroupList(): Promise<Group[]> {
        console.log("API call: list");
        
        return this.groupService.findAll();
    }
}
