import { Controller, Get, Header } from '@nestjs/common';
import { NodeInfo } from './nodeinfo.schema';
import { PostService } from '../..//post/post.service';
import * as pjson from 'pjson';
import { ConfigService } from '../..//config/config.service';
import { UserAuthenticationService } from '../../user/user-authentication/user-authentication.service';
import { subMonths } from 'date-fns';

/**
 * Controller for NodeInfo documents
 * 
 * This endpoint provides a NodeInfo-compatible document indicating
 * the server's capabilities and other metadata.
 *
 * @export
 * @class NodeinfoController
 */
@Controller()
export class NodeinfoController {
    constructor(
        private readonly authService: UserAuthenticationService,
        private readonly postService: PostService,
        private readonly configService: ConfigService
    )
    {}

    /**
     * Get this server's NodeInfo metadata.
     * 
     * Note that Nest doesn't seem to like setting the Content-Type header
     * the way the NodeInfo spec wants. For now, we'll use simple JSON.
     *
     * @returns A JSON object following the NodeInfo schema
     * @memberof NodeinfoController
     */
    @Get('.well-known/nodeinfo')
    @Header('Content-Type', 'application/json')
    async getNodeInfo(): Promise<NodeInfo> {
        const oneMonthAgo = subMonths(new Date, 1);
        const sixMonthsAgo = subMonths(oneMonthAgo, 5);

        const info: NodeInfo = {
            version: '2.1',

            software: {
                name: 'themis',
                version: pjson.version
            },

            protocols: ['activitypub'],

            services: {
                inbound: [],
                outbound: []
            },

            // TODO: Server config setting to allow/deny open registrations
            openRegistrations: true,

            usage: {
                users: {
                    total: await this.authService.count(),
                    activeHalfYear: await this.authService.countActiveSince(sixMonthsAgo),
                    activeMonth: await this.authService.countActiveSince(oneMonthAgo)
                },

                localPosts: await this.postService.countLocal()
            },

            // TODO: Lots of server metadata
            metadata: {}
        };

        return info;
    }
}
