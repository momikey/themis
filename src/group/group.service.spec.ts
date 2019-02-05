import { Test, TestingModule } from '@nestjs/testing';
import { GroupService } from './group.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './group.entity';
import { ConfigService } from '../config/config.service';


jest.mock('../config/config.service');
const ConfigServiceMock = <jest.Mock<ConfigService>>ConfigService;

describe('GroupService', () => {
  let service: GroupService;

  const mockRepository = {
    data: [
      { id: 1, name: 'first', server: 'example.com', displayName: 'Testing', summary: '' },
      { id: 2, name: 'second', server: 'example.com', displayName: 'Testing', summary: '' },
      { id: 3, name: 'third', server: 'example.invalid', displayName: 'Foreign', summary: ''}
    ],

    count () { return this.data.length },
    find () { return this.data },
    findOne (id: number) { return this.data.find((e) => (e.id === id)) },
    findByIds (ids: number[]) { return this.data.filter((e) => ids.find(e)); },
    save (entity: Group) { return entity },
    create (entity: Group) {return entity },
    remove (entity: Group) { return entity }, 
    createQueryBuilder () { /* ... */ }
  }
  
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        { provide: getRepositoryToken(Group), useValue: mockRepository },
        { provide: ConfigService, useClass: ConfigServiceMock },
      ],
    }).compile();

    service = module.get<GroupService>(GroupService);
    let repository = module.get<Repository<Group>>(getRepositoryToken(Group));

    ConfigServiceMock.mockImplementation(() => {
      return {
        get serverAddress () { return 'example.com' },
        get serverPort () { return 80; }
      }
    });
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll method should return all entities', async () => {
    const result = await service.findAll();

    expect(result).toBeDefined();
    expect(result.length).toEqual(3);
  });

  it('find should find a single entity', async () => {
    const result = await service.find(1);    

    expect(result).toBeDefined();
    expect(result.id).toEqual(1);
  });
});
