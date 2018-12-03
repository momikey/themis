// This controller handles operations on a group as an ActivityPub actor object.

import { Controller, Get, Param, Post, Body, Put, Delete, NotFoundException } from '@nestjs/common';
import { GroupActor } from '../group-actor.dto';
import { ApgroupService } from './apgroup.service';
import { GroupActorHelper } from '../group-actor.helper';

@Controller('group')
export class ApgroupController {
    constructor(
        private readonly apgroupService: ApgroupService,
        private readonly helper: GroupActorHelper
        )
    {}

    // Note: We'll need to add authentication, etc. to this at a later time.

    // Create a new group.
    @Post()
    create(@Body() createApgroupDto: GroupActor) {
        this.apgroupService.create(createApgroupDto);
    }

    // Retrieve an existing group.
    @Get(':name')
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
    @Get()
    async findAll() {
        const response = this.apgroupService.getAllGroups();

        return response.then(r => r.data.map(element => {
            return this.helper.groupActorFromEntity(element);
        }));
    }

    // Update an existing group.
    @Put(':name')
    update(@Param('name') name: string, @Body() createApgroupDto: GroupActor) {
        this.apgroupService.update(name, createApgroupDto);
    }

    // Delete a group.
    @Delete(':name')
    remove(@Param('name') name: string) {
        this.apgroupService.delete(name);
    }
}