import { Controller, Get, Param } from '@nestjs/common';
import { ApgroupService } from './apgroup.service';
import { GroupActorHelper } from '../group-actor.helper';

// ApgroupController handles requests that look for groups as ActivityPub Actors.

@Controller('api/group')
export class ApgroupController {
    constructor(
        private readonly apgroupService: ApgroupService,
        private readonly helper: GroupActorHelper
        )
    {}

    // Note: We may need to add authentication, etc. to this at a later time.

    // Retrieve an existing group.
    @Get('/get/:name')
    async find(@Param('name') name: string) {
        // return (await this.apgroupService.findGroup(name)).data;
        const response = this.apgroupService.findGroup(name);

        return response.then(r => {
            if (!r.data.statusCode) {
                return this.helper.groupActorFromEntity(r.data)
            } else {
                return r.data;
            }
        });
    }

    // Retrieve a list of all groups.
    @Get('/all')
    async findAll() {
        const response = this.apgroupService.getAllGroups();

        return response.then(r => r.data.map(element => {
            return this.helper.groupActorFromEntity(element);
        }));
    }
}