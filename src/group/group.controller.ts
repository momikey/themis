import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { GroupService } from './group.service';
import { Group } from './group.entity';
import { CreateGroupDto } from './create-group.dto';

@Controller('internal/groups')
export class GroupController {
    constructor(private readonly groupService: GroupService) {}

    @Get()
    async findAll(): Promise<Group[]> {
        return this.groupService.findAll();
    }

    @Get('/:id')
    async find(@Param('id') id: number): Promise<Group> {
        return this.groupService.find(id);
    }

    @Post()
    async create(@Body() group: CreateGroupDto): Promise<Group> {
        return this.groupService.create(group);
    }

    @Delete('/:id')
    async delete(id: number): Promise<Group> {
        return this.groupService.delete(id);
    }
}
