import { Test, TestingModule } from '@nestjs/testing';
import { ActivityService } from './activity.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Activity } from '../definitions/activities/activity.entity';
import { Repository } from 'typeorm/repository/Repository';
import { GroupService } from '../../group/group.service';
import { UserService } from '../../user/user.service';
import { PostService } from '../../post/post.service';
import { ConfigService } from '../../config/config.service';
import { activityFromObject } from '../definitions/activities/create-activity';
import { AP } from '../definitions/constants';
import { ActorType, parseActor } from '../definitions/actor.interface';

import { PostObject } from '../definitions/activities/post-object';


jest.mock('../../group/group.service');
jest.mock('../../user/user.service');
jest.mock('../../post/post.service');

jest.mock('../../config/config.service');
const ConfigServiceMock = <jest.Mock<ConfigService>>ConfigService;
ConfigServiceMock.mockImplementation(() => {
  return {
    serverAddress: 'example.com',
    serverPort: 443,
    isFederating: false
  }
});

jest.mock('typeorm/repository/Repository');

describe('ActivityService', () => {
  let service: ActivityService;
  let groupService: jest.Mocked<GroupService>
  let userService: jest.Mocked<UserService>;
  let postService: jest.Mocked<PostService>;
  let configService: jest.Mocked<ConfigService>;
  let repository: jest.Mocked<Repository<Activity>>;
  
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityService,
        GroupService,
        UserService,
        PostService,
        { provide: ConfigService, useClass: ConfigServiceMock },
        { provide: getRepositoryToken(Activity), useClass: Repository },
      ],
    }).compile();

    service = module.get<ActivityService>(ActivityService);
    groupService = module.get<GroupService>(GroupService) as jest.Mocked<GroupService>;
    userService = module.get<UserService>(UserService) as jest.Mocked<UserService>;
    postService = module.get<PostService>(PostService) as jest.Mocked<PostService>;
    configService = module.get<ConfigService>(ConfigService) as jest.Mocked<ConfigService>;
    repository = module.get<Repository<Activity>>(getRepositoryToken(Activity)) as
      jest.Mocked<Repository<Activity>>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should connect to services', () => {
    expect(groupService).toBeDefined();
    expect(userService).toBeDefined();
    expect(postService).toBeDefined();
    expect(configService).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('Method testing', () => {
    beforeAll(async () => {
    });

    it('parsing a list of groups should work', () => {
      const targets = [
        'https://example.com/group/abc',
        'https://example.com/group/def',
        'https://example.com/user/somebody',
        'https://foreign.invalid/group/whatever'
      ];

      const groups = parseActor(targets, ActorType.Group);
      const users = parseActor(targets, ActorType.User);

      expect(groups).toBeDefined();
      expect(users).toBeDefined();
      expect(groups).toHaveLength(3);
      expect(users).toHaveLength(1);
      expect(groups[0].name).toBe('abc')
      expect(users[0].name).toBe('somebody');
    });

    it('creating a new activity from a post object should work', async () => {
      const object: PostObject = {
        '@context': AP.Context,
        type: 'Article',
        attributedTo: 'https://example.com/user/somebody',
        summary: 'A test post',
        content: 'This is a test',
        to: ['https://example.com/group/test']
      };

      const result = activityFromObject(object);

      expect(result).toBeDefined();
      expect(result.object.type).toBe(object.type);
      expect(result.to).toBe(object.to);
    });

    it('creating a URI from an activity should do that', () => {
      const activity: Activity = {
        id: 1,
        type: 'Create',
        activityObject: {},
        created: new Date(),

        targetUser: undefined,
        targetGroup: undefined,
        targetPost: undefined,
      };

      const result = service.getIdForActivity(activity);

      expect(result).toBeDefined();
      expect(result).toBe('https://example.com/p/1');
    });

    it('saving an activity should work', async () => {
    });
  });
});
