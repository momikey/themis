import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from './group.entity';
import { CreateGroupDto } from './create-group.dto';

@Injectable()
export class GroupService {
    constructor(
        @InjectRepository(Group)
        private readonly groupRepository: Repository<Group>
    ) {}

    async create(group: CreateGroupDto): Promise<Group> {
        const groupEntity = new Group();
        groupEntity.name = group.name;
        groupEntity.server = group.server;
        groupEntity.displayName = group.displayName;
        groupEntity.summary = group.summary;

        return await this.groupRepository.save(groupEntity);
    }

    async delete(name: string): Promise<Group> {
        const group = await this.groupRepository.findOne({ name: name });

        return await this.groupRepository.remove(group);
    }

    async findAll(): Promise<Group[]> {
        return await this.groupRepository.find();
    }

    async find(id: number): Promise<Group> {
        return await this.groupRepository.findOne(id);
    }

    async findByName(name: string): Promise<Group> {
        return await this.groupRepository.findOne({ name: name });
    }
}
