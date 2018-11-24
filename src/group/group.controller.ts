import { Controller, Get } from '@nestjs/common';
import { GroupService } from './group.service';
import { Group } from './group.entity';

@Controller('group')
export class GroupController {
    constructor(private readonly groupService: GroupService) {}

    @Get()
    async findAll(): Promise<Group[]> {
        return this.groupService.findAll();
    }
}
