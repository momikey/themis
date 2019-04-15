import { Controller, Get, Delete, Body, Param, NotFoundException, Put, BadRequestException } from '@nestjs/common';
import { Post as HttpPost } from '@nestjs/common';
import { GroupService } from './group.service';
import { Group } from '../entities/group.entity';
import { CreateGroupDto } from '../dtos/create-group.dto';
import { Post } from 'src/entities/post.entity';
import { UpdateGroupDto } from '../dtos/update-group.dto';
import { GroupFilterEntry } from 'src/filter/group-filter';

@Controller('internal/groups')
export class GroupController {
    constructor(private readonly groupService: GroupService) {}

    @Get()
    async findAll(): Promise<Group[]> {
        return await this.groupService.findAll();
    }

    // Note that this is a "getter" that uses a POST method.
    // I'm doing this because I don't know the limit on GET
    // param length, and a user can have an arbitrary number
    // of filters. Maybe there's a better way to do this.
    @HttpPost('/get-filtered-list')
    async getWithFilters(@Body() filters: GroupFilterEntry[]) {
        const response = await this.groupService.findAll();

        if (response) {
            return this.groupService.filterGroups(response, filters);
        } else {
            throw new BadRequestException();
        }
    }

    @Get('/by-name/:name')
    async find(@Param('name') name: string): Promise<Group> {
        const response = await this.groupService.findByName(name);

        if (response) {
            return response;
        } else {
            throw new NotFoundException(name);
        }
    }

    @Get('/get-top-level-posts/:name')
    async getTopLevelByName(@Param('name') name: string): Promise<Post[]> {
        const response = await this.groupService.getTopLevelPostsOld(name);

        if (response) {
            return response;
        } else {
            throw new NotFoundException(name);
        }
    }

    // TODO: Authentication
    @HttpPost('/create-group/')
    async create(@Body() group: CreateGroupDto): Promise<Group> {
        return await this.groupService.create(group);
    }

    // TODO: Authentication
    @Put('/update-group/:id')
    async update(@Body() group: UpdateGroupDto): Promise<Group> {
        return this.groupService.update(group);
    }

    // TODO: Authentication
    @Delete('/delete-group/:id')
    async delete(@Param('id') id: number): Promise<Group> {
        return this.groupService.delete(id);
    }
}
