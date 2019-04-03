import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ActivityService } from './activity.service';

@Controller('p')
export class ActivityController {
    constructor(
        private readonly activityService: ActivityService
    ) {}

    @Get(':id')
    async getActivity(@Param('id') id: number): Promise<object> {
        const activity = await this.activityService.findById(id);

        // TODO: Add handling for 403, 410, 451 situations
        if (activity) {
            return activity.activityObject;
        } else {
            throw new NotFoundException();
        }
    }
}
