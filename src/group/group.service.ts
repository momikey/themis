import { Injectable } from '@nestjs/common';
import { Repository, FindOperator } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from './group.entity';
import { CreateGroupDto } from './create-group.dto';
import { Post } from '../post/post.entity';
import { ConfigService } from '../config/config.service';

@Injectable()
export class GroupService {
    constructor(
        @InjectRepository(Group)
        private readonly groupRepository: Repository<Group>,
        private readonly configService: ConfigService
    ) {}

    async create(group: CreateGroupDto): Promise<Group> {
        const groupEntity = this.groupRepository.create({
            name: group.name,
            server: group.server || this.configService.serverAddress,
            displayName: group.displayName,
            summary: group.summary
        });

        return await this.groupRepository.save(groupEntity);
    }

    async delete(name: string): Promise<Group> {
        const group = await this.groupRepository.findOne({ name: name });

        return await this.groupRepository.remove(group);
    }

    async findAll(): Promise<Group[]> {
        return this.groupRepository.find();
    }

    async find(id: number): Promise<Group> {
        return await this.groupRepository.findOne(id);
    }

    async findByName(name: string): Promise<Group> {
        const response = await this.groupRepository.findOne({ name: name });

        return response;
    }

    async findByIds(ids: number[]): Promise<Group[]> {
        return this.groupRepository.findByIds(ids);
    }

    // Get all "top-level" posts in a group (i.e., those without a parent).
    // We can do this by either database ID or group name.
    async getTopLevelPosts(group: string | number): Promise<Post[]> {
        // const groupEntity = await (typeof group === 'number'
        //     ? this.find(group)
        //     : this.findByName(group)
        // );

        const groupId = (typeof group === 'number'
            ? group
            : (await this.findByName(group)).id
        );

        const response = await this.groupRepository
            .createQueryBuilder('groups')
            .leftJoin('groups.posts', 'post')
            .leftJoin('post.sender', 'sender')
            .select(['groups', 'post.id', 'post.subject', 'sender', 'post.timestamp', 'post.uuid'])
            // .leftJoinAndSelect('groups.posts', 'post')
            .where('groups.id = :id', { id: groupId })
            .andWhere('post.parentId is null')
            .getOne();

        return response.posts;
    }
}
