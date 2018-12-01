import { Controller, Get, Post, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { GroupService } from './group.service';
import { Group } from './group.entity';
import { CreateGroupDto } from './create-group.dto';

@Controller('internal/groups')
export class GroupController {
    constructor(private readonly groupService: GroupService) {}

    @Get()
    async findAll(): Promise<Group[]> {
        return await this.groupService.findAll();
    }

    @Get('/:name')
    async find(@Param('name') name: string): Promise<Group> {
        const response = await this.groupService.findByName(name);

        if (response) {
            return response;
        } else {
            throw new NotFoundException(name);
        }
    }

    @Post()
    async create(@Body() group: CreateGroupDto): Promise<Group> {
        return await this.groupService.create(group);
    }

    @Delete('/:name')
    async delete(@Param('name') name: string): Promise<Group> {
        return await this.groupService.delete(name);
    }
}
