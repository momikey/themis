import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '../config/config.service';
import { Repository } from 'typeorm/repository/Repository';
import { ServerService } from '../server/server.service';
import { Server } from '../entities/server.entity';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';

jest.mock('../config/config.service');
jest.mock('../server/server.service');
const ConfigServiceMock = <jest.Mock<ConfigService>>ConfigService as any;
ConfigServiceMock.mockImplementation(() => {
  return {
    serverAddress: 'example.com',
    serverPort: 80
  }
});

jest.mock('typeorm/repository/Repository');

// jest.mock('typeorm/entity-manager/EntityManager');
const EntityManagerMock = jest.fn();
EntityManagerMock.mockReturnValue({
  findOne: jest.fn().mockResolvedValue(undefined),
});

describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<Repository<User>>;
  let configService: jest.Mocked<ConfigService>;
  let serverService: jest.Mocked<ServerService>;

  let entityManager = EntityManagerMock();
  
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useClass: Repository },
        { provide: ConfigService, useClass: ConfigServiceMock },
        ServerService
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User)) as jest.Mocked<Repository<User>>;
    configService = module.get<ConfigService>(ConfigService) as jest.Mocked<ConfigService>;
    serverService = module.get<ServerService>(ServerService) as jest.Mocked<ServerService>;

    Object.defineProperty(repository, 'manager',  { get: jest.fn().mockReturnValue(entityManager) } );
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  it('should have configuation values', () => {
    expect(configService).toBeDefined();
    expect(configService.serverAddress).toBeDefined();
    expect(configService.serverAddress).toBe('example.com');
    expect(configService.serverPort).toBeDefined();
    expect(configService.serverPort).toBe(80);
  });

  describe('Method testing', () => {
    const makeServer = (host) => Object.assign(new Server, { host });

    const data: User[] = [
      { id: 1, name: 'user', displayName: 'Test User', server: makeServer('example.com'), summary: '', icon: '', date: '', posts: [], activities: [], uri:''},
      { id: 2, name: 'other', displayName: 'Test User', server: makeServer('example.invalid'), summary: '', icon: '', date: '', posts: [], activities: [], uri:''},
      { id: 3, name: 'another', displayName: 'Test User', server: makeServer('local.local'), summary: '', icon: '', date: '', posts: [], activities: [], uri:''},
      ].map((_) => Object.assign(new User, _));

    beforeAll(() => {
      repository.create.mockImplementation((entity) => Object.assign(new User, entity));
      repository.save.mockImplementation(async (entity) => entity as User);
      repository.find.mockResolvedValue(data);
      repository.remove.mockImplementation(async (entity) => entity);
      repository.findOneOrFail.mockImplementation((o: {name: string}) => {
        const result = data.find((e) => e.name === o.name);

        if (result) {
          return Promise.resolve(Object.assign(new User, result));
        } else {
          return Promise.reject();
        }
      });
      repository.findOne.mockImplementation(async (o: {name: string}) => {
        const result = data.find((e) => e.name === o.name);

        if (result) {
          return Object.assign(new User, result);
        } else {
          return undefined;
        }
      });

      serverService.local.mockResolvedValue(Object.assign(new Server, {
        host: 'example.com',
        port: 80,
        scheme: 'http'
      }));
    });

    it('create should create a new DB entry and return it', async () => {
      const testData: CreateUserDto = {
        name: 'newuser',
        server: 'example.com',
        displayName: 'Test User',
        summary: '',
        iconUrl: ''
      };

      const result = await service.create(testData);

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(User);
      expect(result.name).toBe(testData.name);
    });

    it('creating an empty user entry should do exactly that, then return it', async () => {
      const username = 'newuser';

      const result = await service.createEmptyUserEntry(username);

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(User);
      expect(result.server.host).toBe('example.com');
    });

    it('delete should remove an entry from the DB and return it', async () => {
      const username = 'user';

      const result = await service.delete(username);

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(User);
      expect(result).toMatchObject(data[0]);
    });

    it('findAll should return all DB entities', async () => {
      const result = await service.findAll();

      expect(result).toBeDefined();
      expect(result.length).toBe(data.length);
    });

    it('find should return the DB entity with the given ID', async () => {
      repository.findOneOrFail.mockImplementation(async (_: {id: number}) =>
        Object.assign(new User, (data.find((e) => e.id === _.id) as User))
      );

      const result = await service.find(1);

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(User);
      // expect(result).toMatchObject(data[0]);
    });

    it('finding by name should return the DB entry with the given name', async () => {
      const result = await service.findByName('user');

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(User);
      // expect(result).toMatchObject(data[0]);
    });
  });
});
