import { Test, TestingModule } from '@nestjs/testing';
import { ApGroupService } from './ap-group.service';
import { GroupService } from '../../group/group.service';
import { GroupActor } from '../definitions/actors/group.actor';
import { AP } from '../definitions/constants';
import { ConfigService } from '../../config/config.service';
import { UserService } from '../../user/user.service';
import { ActivityService } from '../activity/activity.service';
import { Server } from '../../entities/server.entity';
import { Group } from '../../entities/group.entity';
import { ActorEntity } from '../../entities/actor.entity';

jest.mock('../../group/group.service');
jest.mock('../../user/user.service');
jest.mock('../activity/activity.service');
jest.mock('../../config/config.service');

describe('ApGroupService', () => {
  let service: ApGroupService;
  let groupService: jest.Mocked<GroupService>;
  let configService: jest.Mocked<ConfigService>;
  
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApGroupService,
        GroupService,
        UserService,
        ActivityService,
        ConfigService
      ],
    }).compile();

    service = module.get<ApGroupService>(ApGroupService);
    groupService = module.get<GroupService>(GroupService) as jest.Mocked<GroupService>;
    configService = module.get<ConfigService>(ConfigService) as jest.Mocked<ConfigService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  
  it('should conntect to services', () => {
    expect(groupService).toBeDefined();
  });

  describe('Method testing', () => {
    const sampleServer = Object.assign(new Server, {
      host: 'example.com',
      scheme: 'http'
    });

    beforeAll(() => {
      const { GroupService } = jest.requireActual('../../group/group.service');
      const actual = new GroupService();
      groupService.createActor = jest.fn(actual.createActor);
      groupService.idForGroup = jest.fn(actual.idForGroup);

      const sampleGroup = Object.assign(new Group, {
        id: 1,
        name: 'group',
        server: sampleServer,
        displayName: 'A Group',
        summary: 'A testing group',
        posts: [],
        date: (new Date).toDateString()
      });

      sampleGroup.actor = Object.assign(new ActorEntity, 
        { object: groupService.createActor(sampleGroup) });

      groupService.findLocalByName.mockResolvedValue(sampleGroup);
    });

    it('getting a local group should return a valid object', async () => {
      const result = await service.getLocalGroup('group');

      expect(result).toBeDefined();
      expect(result).toEqual(expect.any(Group));
      expect(result.name).toBe('group');
    });

    it('getting the actor object should return a proper value', async () => {
      const result = await service.getActorForGroup('group');

      expect(result).toBeDefined();
      expect(result['@context']).toBe(AP.Context);
      expect(result.id).toMatch(/http:/);
    });
  });
});
