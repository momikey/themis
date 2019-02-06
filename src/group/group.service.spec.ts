import { Test, TestingModule } from '@nestjs/testing';
import { GroupService } from './group.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { Group } from './group.entity';
import { ConfigService } from '../config/config.service';


jest.mock('../config/config.service');
const ConfigServiceMock = <jest.Mock<ConfigService>>ConfigService;
ConfigServiceMock.mockImplementation(() => {
  return {
    serverAddress: 'example.com',
    serverPort: 80
  }
});

jest.mock('typeorm/repository/Repository');

describe('GroupService', () => {
  let service: GroupService;
  let repository: jest.Mocked<Repository<Group>>;
  let configService: jest.Mocked<ConfigService>;

  const testData = [
      { id: 1, name: 'first', server: 'example.com', displayName: 'Testing', summary: '' },
      { id: 2, name: 'second', server: 'example.com', displayName: 'Testing', summary: '' },
      { id: 3, name: 'third', server: 'example.invalid', displayName: 'Foreign', summary: ''}
    ];
  
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        { provide: getRepositoryToken(Group), useClass: Repository },
        { provide: ConfigService, useClass: ConfigServiceMock },
      ],
    }).compile();

    service = module.get<GroupService>(GroupService);
    repository = module.get<Repository<Group>>(getRepositoryToken(Group)) as jest.Mocked<Repository<Group>>;
    configService = module.get<ConfigService>(ConfigService) as jest.Mocked<ConfigService>;

    repository.count.mockImplementation(() => testData.length);
    repository.find.mockImplementation(() => testData);
    repository.save.mockImplementation((entity) => entity);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have configuation values', () => {
    expect(configService).toBeDefined();
    expect(configService.serverAddress).toBeDefined();
    expect(configService.serverAddress).toBe('example.com');
    expect(configService.serverPort).toBeDefined();
    expect(configService.serverPort).toBe(80);
  });

  describe('Method testing', () => {    
    it('findAll method should return all entities', async () => {
      const result = await service.findAll();

      expect(result).toBeDefined();
      expect(result.length).toEqual(3);
    });

    it('findByName should find a single entity', async () => {
      repository.findOne.mockImplementation((o) => testData.find((_) => _.name === o.name));

      const result = await service.findByName('first');

      expect(result).toBeDefined();
      expect(result).toBe(testData[0]);
    });

    it('find should find a single entity', async () => {
      repository.findOne.mockImplementation((id) => testData.find((_) => _.id === id));

      const result = await service.find(1);    

      expect(result).toBeDefined();
      expect(result.id).toEqual(1);
    });

    it('findByIds should get all entities whose IDs are in the given list', async () => {
      repository.findByIds.mockImplementation((ids) => testData.filter((_) => ids.includes(_.id)));

      const result = await service.findByIds([1,3]);

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result.includes(testData[0] as Group)).toBeTruthy();
      expect(result.includes(testData[1] as Group)).toBeFalsy();
    });

    it('delete should delete an entity from the DB and return it', async () => {
      repository.remove.mockImplementation((entity) => entity);

      const result = await service.delete(1);

      expect(result).toBeDefined();
      expect(result).toStrictEqual(testData[0]);
    });

    it('create should properly create a Group entity', async () => {
      repository.create.mockImplementation((entity) => entity);
      repository.save.mockImplementation((entity) => entity);

      const result = await service.create({
        name: 'second',
        server: '',
        displayName: 'Testing',
        summary: ''
      });


      expect(result).toBeDefined();
      expect(result.server).toBe(testData[1].server);
    });

    it('update should update an entity and return it', async () => {
      repository.count.mockImplementation((o) => testData.filter((_) => o.id === _.id).length);
      repository.save.mockImplementation((entity) => entity);

      const result = await service.update({
        id: 2,
        name: 'second',
        server: 'example.com',
        displayName: 'Testing',
        summary: '',
        date: ''
      });

      expect(result).toBeDefined();
      expect(result.id).toBe(2);
    });
  });
});
