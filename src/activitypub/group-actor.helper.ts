import { Injectable } from "@nestjs/common";
import { ConfigService } from "src/config/config.service";
import { Group } from "src/group/group.entity";
import { GroupActor } from "./group-actor.dto";

@Injectable()
export class GroupActorHelper {
    constructor (private readonly config: ConfigService) {}

    groupActorFromEntity(entity: Group): GroupActor {
        const port = this.config.serverPort;
        const schema = 'https';
        const address = this.config.serverAddress + (port == 80 ? '' : `:${port}`);
        const actor: GroupActor = {
            '@context':        'https://www.w3.org/ns/activitystreams',
            id:                `${schema}://${address}/${entity.name}`,
            type:              'Group',
            preferredUsername: entity.displayName,
            inbox:             `${schema}://${address}/${entity.name}/inbox`,
            outbox:            `${schema}://${address}/${entity.name}/outbox`
        };

        return actor;
    }
}