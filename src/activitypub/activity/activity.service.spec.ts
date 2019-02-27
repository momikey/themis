import { Test, TestingModule } from '@nestjs/testing';
import { ActivityService } from './activity.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Activity } from '../definitions/activities/activity.entity';
import { Repository } from 'typeorm/repository/Repository';
import { GroupService } from '../../group/group.service';
import { UserService } from '../../user/user.service';
import { PostService } from '../../post/post.service';
import { ConfigService } from '../../config/config.service';
import { CreateActivity } from '../definitions/activities/create-activity';
import { AP } from '../definitions/constants';
import { ActorType } from '../definitions/actor.interface';
import { ApGroupService } from '../ap-group/ap-group.service';
import { ApUserService } from '../ap-user/ap-user.service';
import { PostObject } from '../definitions/activities/post-object';

jest.mock('../../group/group.service');
jest.mock('../../user/user.service');
jest.mock('../../post/post.service');
jest.mock('../ap-group/ap-group.service');
jest.mock('../ap-user/ap-user.service');

jest.mock('../../config/config.service');
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
        ConfigService,
        { provide: getRepositoryToken(Activity), useClass: Repository },
        ApGroupService,
        ApUserService
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
    beforeAll(() => {

    });

    it('parsing a list of groups should work', () => {
      const targets = [
        'https://example.com/group/abc',
        'https://example.com/group/def',
        'https://example.com/user/somebody',
        'https://foreign.invalid/group/whatever'
      ];

      const groups = service.parseActor(targets, ActorType.Group);
      const users = service.parseActor(targets, ActorType.User);

      expect(groups).toBeDefined();
      expect(users).toBeDefined();
      expect(groups).toHaveLength(3);
      expect(users).toHaveLength(1);
      expect(groups[0].name).toBe('abc')
      expect(users[0].name).toBe('somebody');
    });

    it('creating a new post object should work', () => {
      const activity: CreateActivity = {
        '@context': AP.Context,
        id: '',
        type: 'Create',
        actor: 'https://example.com/user/somebody',
        published: new Date().toJSON(),
        to: [
          'https://example.com/group/this',
          'https://example.com/group/that',
          AP.Public
        ],
        object: {
          '@context': AP.Context,
          type: 'Article',
          attributedTo: 'https://example.com/user/somebody',
          summary: 'A test post',
          content: 'This is a test'
        }
      };

      const result = service.createNewGlobalPost(activity);

      expect(result).toBeDefined();
      expect(result.sender).toMatchObject({name: 'somebody', server: 'example.com'});
      expect(result.subject).toEqual(expect.any(String));
      expect(result.content).toEqual(expect.any(String));
      expect(result.groups.length).toBe(2);
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

      const result = service.activityFromObject(object);

      expect(result).toBeDefined();
      expect(result.object.type).toBe(object.type);
      expect(result.to).toBe(object.to);
    });
  });
});
