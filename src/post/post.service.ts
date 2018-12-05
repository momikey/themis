import { Injectable } from '@nestjs/common';
import { Repository, getRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { CreatePostDto } from './create-post.dto';
import { ConfigService } from 'src/config/config.service';
import * as uuidv5 from 'uuid/v5';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class PostService {
    constructor(
        @InjectRepository(Post)
        private readonly postRepository: Repository<Post>,
        private readonly configService: ConfigService,
        private readonly userService: UserService
    ) {}

    async create(post: CreatePostDto) {
        const postEntity = this.postRepository.create({
            uuid: uuidv5(this.configService.serverAddress, uuidv5.DNS),
            sender: await this.userService.findByName(post.sender),
            server: post.server,
            subject: post.subject,
            parent: post.parent,
            groups: [post.primaryGroup].concat(post.ccGroups),
            content: post.content,
            source: post.source
        });

        return await this.postRepository.save(postEntity);
    }

    async delete(uuid: string): Promise<Post> {
        const post = await this.postRepository.findOne({ uuid: uuid });

        return await this.postRepository.remove(post);
    }

    async findAll(): Promise<Post[]> {
        return await this.postRepository.find();
    }

    async find(id: number): Promise<Post> {
        return await this.postRepository.findOne(id);
    }

    async findbyUuid(uuid: string): Promise<Post> {
        return await this.postRepository.findOne({ uuid: uuid });
    }
}
