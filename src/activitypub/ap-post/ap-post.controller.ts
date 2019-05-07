import { Controller, Get, Param, NotFoundException, GoneException } from '@nestjs/common';
import { ApPostService } from './ap-post.service';
import { PostObject } from '../definitions/activities/post-object';
import { TombstoneObject } from '../definitions/activities/tombstone-object';

/**
 * The controller handles individual posts on the server.
 * Themis doesn't directly support anything but retrieving these;
 * sending posts is handled by posting "Create" messages to a user's
 * outbox.
 *
 * @export
 * @class ApPostController
 */
@Controller('post')
export class ApPostController {
    constructor(
        private readonly apPostService: ApPostService,
    ) {}

    /**
     * Get a post based on its UUID. This is the primary method
     * or retrieving from a foreign server, as the UUID uniquely
     * identifies a post across the Themis network.
     *
     * @param uuid The UUID of the post
     * @returns An ActivityPub object representing the post, or a
     * Tombstone object if it has been deleted
     * @memberof ApPostController
     */
    @Get('/:uuid')
    async getPostByUuid(@Param('uuid') uuid: string): Promise<PostObject | TombstoneObject> {
        const result = await (async () => {
            try {
                const r = await this.apPostService.getPostByUuid(uuid);
                return r;
            } catch (e) {
                throw new NotFoundException(e);
            }
        })();

        if (result.deleted) {
            throw new GoneException(result);
        } else {
            return result;
        }
    }

    /**
     * Get a post based on its internal database ID. These are local
     * to this server, and not intended to be used by ActivityPub
     * clients. The Themis frontend uses them for easier retrieval.
     *
     * @param id The database ID of the desired post
     * @returns Either an object repreenting the post or a Tombstone,
     * in the event it has been deleted (for "hard" deletions, the server
     * will return a 410 Gone status)
     * @memberof ApPostController
     */
    @Get('/id/:id')
    async getPostById(@Param('id') id: number): Promise<PostObject | TombstoneObject> {
        const result = await (async () => {
            try {
                const r = await this.apPostService.getPostById(id);
                return r;
            } catch (e) {
                throw new NotFoundException(e);
            }
        })();

        if (result.deleted) {
            throw new GoneException(result);
        } else {
            return result;
        }
    }
}
