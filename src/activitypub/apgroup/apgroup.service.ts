import { Injectable, HttpService } from '@nestjs/common';

// ApgroupService is the back end for retrieving ActivityPub groups.
// These are intended to be Actor objects, as per the AP spec, 
@Injectable()
export class ApgroupService {
    constructor(
        private readonly httpService: HttpService,
    ) {}

    // Find a single group, given its "internal" name.
    findGroup(name: string) {
        const response = this.httpService.get(
            'http://localhost:3000/internal/groups/' + name);
        let p = response.toPromise()
            .then(r => r)
            .catch(e => e.response);

        return p;
    }

    // Get all the groups known to this server.
    // TODO: Should this only retrieve *local* groups?
    // (Something to think about when we start looking into federation, etc.)
    getAllGroups() {
        const response = this.httpService.get(
            'http://localhost:3000/internal/groups');
        let p = response.toPromise()
            .then(r => r)
            .catch(e => e.response);
        
        return p;
    }
}
