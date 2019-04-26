import { Controller, Get, Query, Param, Post as HttpPost, UseGuards, Body } from '@nestjs/common';
import { GroupService } from '../../group/group.service';
import { Group } from '../../entities/group.entity';
import { Post } from '../../entities/post.entity';
import { AuthGuard } from '@nestjs/passport';
import { CreateGroupDto } from '../../dtos/create-group.dto';

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

    /**
     * Get a list of groups on the server. This list can be sorted
     * by date or name. (We may add more options in the future.)
     *
     * @param [sortBy] The column to sort by: date or name
     * @param [descending] Whether to sort descending (true) or ascending (false)
     * @returns A list of Group objects, optionally sorted by the given criteria
     * @memberof GroupController
     */
    @Get('list')
    async getGroupList(@Query('sort') sortBy? : string, @Query('desc') descending? : boolean): Promise<Group[]> {
        switch (sortBy) {
            case 'date':
            case 'name':
                return this.groupService.findAllSorted(sortBy, descending || false);
            default:
                return this.groupService.findAll();
        }
    }

    @Get('get-by-id/:id')
    async getById(@Param('id') id: number): Promise<Group> {
        return this.groupService.find(id);
    }

    @Get('get-top-level-posts/:group')
    async getTopLevelPosts(@Param('group') group: number, @Query('since') since?: number): Promise<Post[]> {
        return this.groupService.getTopLevelPosts(group, +since || 0);
    }

    @HttpPost('create-group')
    // TODO: Proper capability-based authorization
    @UseGuards(AuthGuard("jwt"))
    async createNewGroup(@Body() body: CreateGroupDto): Promise<Group> {
        return this.groupService.create(body);
    }
}
