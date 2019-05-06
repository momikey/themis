import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ActivityService } from './activity.service';

/**
 * Handles routes for ActivityPub activity objects originating
 * from this server. These are of the form `https://example.com/p/#`,
 * where `#` is a sequential ID number.
 *
 * @export
 * @class ActivityController
 */
@Controller('p')
export class ActivityController {
    constructor(
        private readonly activityService: ActivityService
    ) {}

    /**
     * Access a single Activity object from this server.
     *
     * @param id The ID number of the activity
     * @returns A JSON object conforming to the ActivityPub spec
     * for Activity objects
     * @memberof ActivityController
     */
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
