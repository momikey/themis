import { Injectable, HttpService } from '@nestjs/common';
import { GroupActor } from '../group-actor.dto';
import { Group } from 'src/group/group.entity';
import { ConfigService } from 'src/config/config.service';
import { GroupActorHelper } from '../group-actor.helper';

@Injectable()
export class ApgroupService {
    constructor(
        private readonly httpService: HttpService,
    ) {}

    // !!! Temporary for testing !!!
    private readonly groups = new Map<string, GroupActor>();

    create(group: GroupActor) {
        const username = group.preferredUsername;

        this.groups.set(username, group);
    }

    retrieve(name: string) : GroupActor {
        return this.groups.get(name);
    }

    update(name: string, group: GroupActor) {
        this.groups.set(name, group);
    }

    delete(name: string) {
        this.groups.delete(name);
    }

    findGroup(name: string) {
        const response = this.httpService.get(
            'http://localhost:3000/internal/groups/' + name);
        let p = response.toPromise()
            .then(r => r)
            .catch(e => e.response);

        return p;
    }

    getAllGroups() {
        const response = this.httpService.get(
            'http://localhost:3000/internal/groups');
        let p = response.toPromise()
            .then(r => r)
            .catch(e => e.response);
        
        return p;
    }
}
