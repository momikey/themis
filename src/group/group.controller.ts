import { Controller, Get, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { Post as HttpPost } from '@nestjs/common';
import { GroupService } from './group.service';
import { Group } from './group.entity';
import { CreateGroupDto } from './create-group.dto';
import { Post } from 'src/post/post.entity';

@Controller('internal/groups')
export class GroupController {
    constructor(private readonly groupService: GroupService) {}

    @Get()
    async findAll(): Promise<Group[]> {
        return await this.groupService.findAll();
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
        const response = await this.groupService.getTopLevelPosts(name);

        if (response) {
            return response;
        } else {
            throw new NotFoundException(name);
        }
    }

    @HttpPost('/create-group/')
    async create(@Body() group: CreateGroupDto): Promise<Group> {
        return await this.groupService.create(group);
    }

    // @Delete('/:name')
    // async delete(@Param('name') name: string): Promise<Group> {
    //     return await this.groupService.delete(name);
    // }
}
