import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './create-user.dto';
import { ConfigService } from '../config/config.service';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService
    ) {}

    async create(user: CreateUserDto): Promise<User> {
        const userEntity = this.userRepository.create({
            name: user.name,
            server: user.server || this.configService.serverAddress,
            displayName: user.displayName,
            summary: user.summary || '',
            icon: user.iconUrl || ''
        });

        return this.userRepository.save(userEntity);
    }

    async createEmptyUserEntry(username: string): Promise<User> {
        if (await this.findByName(username)) {
            throw new Error(`Username ${username} already in database`);
        }

        const userEntity = this.userRepository.create({
            name: username,
            server: this.configService.serverAddress,
            displayName: username,
            summary: '',
            icon: ''
        });

        return this.userRepository.save(userEntity);
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
