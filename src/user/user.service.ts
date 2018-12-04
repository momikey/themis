import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './create-user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async create(user: CreateUserDto): Promise<User> {
        const userEntity = new User();
        userEntity.name = user.name;
        userEntity.server = user.server;
        userEntity.displayName = user.displayName;
        userEntity.summary = user.summary;
        userEntity.icon = user.iconUrl;

        return await this.userRepository.save(userEntity);
    }

    async delete(name: string): Promise<User> {
        const user = await this.userRepository.findOne({ name: name });

        return await this.userRepository.remove(user);
    }

    async findAll(): Promise<User[]> {
        return await this.userRepository.find();
    }

    async find(id: number): Promise<User> {
        return await this.userRepository.findOne(id);
    }

    async findByName(name: string): Promise<User> {
        return await this.userRepository.findOne({ name: name });
    }
}
