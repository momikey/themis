import { Controller, Get, Param, NotFoundException, Body, Post, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';

@Controller('internal/users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('get')
    async findAll(): Promise<User[]> {
        return this.userService.findAll();
    }

    @Get('/get/:name')
    async find(@Param('name') name: string): Promise<User> {
        const response = await this.userService.findByName(name);

        if (response) {
            return response;
        } else {
            throw new NotFoundException(name);
        }
    }

    @Post('/create')
    async create(@Body() user: CreateUserDto): Promise<User> {
        return await this.userService.create(user);
    }

    // @Delete('/:name')
    // async delete(@Param('name') name: string): Promise<User> {
    //     return await this.userService.delete(name);
    // }
}