import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { CreateUserDto } from './create-user.dto';
import { NotFoundException } from '@nestjs/common';

jest.mock('./user.service');

describe('User Controller', () => {
  let module: TestingModule;
  let controller: UserController;
  let service: jest.Mocked<UserService>;
  
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService]
    }).compile();

    service = module.get<UserService>(UserService) as jest.Mocked<UserService>;
    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    const controller: UserController = module.get<UserController>(UserController);
    expect(controller).toBeDefined();
  });

  it('successfully connects to service', async () => {
    expect(controller.findAll).toBeDefined();
    expect(await controller.findAll()).toBeUndefined();
  });
  
  describe('Method testing', () => {
    beforeAll(() => {
      const data = [
        { id: 1, name: 'user1', server: 'example.com', displayName: 'User', summary: '', icon: ''},
        { id: 2, name: 'user2', server: 'example.invalid', displayName: 'User', summary: '', icon: ''}
      ];
  
      service.findAll.mockImplementation(() => Promise.resolve(data));
      service.findByName.mockImplementation((name: string) => 
        Promise.resolve(Object.assign(new User, data.find((e) => e.name === name))));
      service.create.mockImplementation((user: CreateUserDto) => {
        const result: User = Object.assign(new User, user);
        result.id = data.length + 1;
        return Promise.resolve(result);
      });
    });

    it('findAll should return all users', async () => {
      const result = await controller.findAll();

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(2);
      expect(result[1].id).toBe(2);
    });

    it('find should return the user with the given name', async () => {
      const result = await controller.find('user1');

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(1);
      expect(result.server).toBe('example.com');
    });

    it('create should create a new entity and return it', async () => {
      const result = await controller.create({
        name: 'test',
        server: 'example.com',
        displayName: 'Test User',
        iconUrl: '',
        summary: '',
      });

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(3);
    });
  });

  describe('Error handling', () => {
    beforeAll(() => {
      service.findByName.mockImplementation((name: string) => (name === 'good') ? new User : undefined);
    });

    it('find by name should return 404 for an invalid user name', async () => {
      const goodResult = await controller.find('good');

      expect(goodResult).toBeDefined();
      expect(goodResult).toBeInstanceOf(User);

      try {
        const result = await controller.find('bad');
      } catch (e) {
        expect(e).toBeDefined();
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });
});
