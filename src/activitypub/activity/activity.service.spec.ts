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
import { ServerService } from '../../server/server.service';
import { HttpService } from '@nestjs/common';


jest.mock('../../group/group.service');
jest.mock('../../user/user.service');
jest.mock('../../post/post.service');

jest.mock('../../config/config.service');
jest.mock('../../server/server.service');

const ConfigServiceMock = <jest.Mock<ConfigService>>ConfigService as any;
ConfigServiceMock.mockImplementation(() => {
  return {
    serverAddress: 'example.com',
    serverPort: 443,
    isFederating: false,
    isHttps: true
  }
});

const HttpMock = jest.fn();

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
        ServerService,
        { provide: ConfigService, useClass: ConfigServiceMock },
        { provide: HttpService, useClass: HttpMock },
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
    const sampleActivities = [
      { type: 'Create', created: new Date('2019-03-15T12:00:00') },
      { type: 'Like', created: new Date('2019-03-15T12:34:56') },
      { type: 'Like', created: new Date('2019-03-15T13:37:00') },
      { type: 'Delete', created: new Date('2019-03-15T12:59:59') }
    ];
    
    beforeAll(async () => {
    });

    it('parsing a list of groups', () => {
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

    it('creating a new activity from a post object', async () => {
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

    it('creating a URI from an activity', () => {
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

    it('saving an activity', async () => {
    });

    it('creating an unordered collection', () => {
      const result = service.createCollection(sampleActivities);

      expect(result).toBeDefined();
      expect(result.type).toBe('Collection');
      expect(result.totalItems).toBe(sampleActivities.length);
      expect(result.items).toHaveLength(result.totalItems);
      expect(result.items[0].type).toBe('Create');
      expect(result.items[3].type).toBe('Delete');
    });

    it('creating an ordered collection', () => {
      // We use `slice()` here because createOrderedCollection
      // modifies the original array.
      const result = service.createOrderedCollection(sampleActivities.slice());

      expect(result).toBeDefined();
      expect(result.type).toBe('OrderedCollection');
      expect(result.totalItems).toBe(sampleActivities.length);
      expect(result.orderedItems).toHaveLength(result.totalItems);
      expect(result.orderedItems[0].type).toBe('Like');
      expect(result.orderedItems[3].type).toBe('Create');
    });

    it('creating a collection page', () => {
      const baseUri = 'http://example.com/test';
      const result = service.createCollectionPage(sampleActivities, baseUri, 2, 2);

      expect(result).toBeDefined();
      expect(result.type).toBe('CollectionPage');
      expect(result.partOf).toBe(baseUri); 
      expect(result.prev).toBe('http://example.com/test?page=1');

      expect(() => {
        service.createCollectionPage(sampleActivities, baseUri, 3, 4);
      }).toThrow();
    });

    it('creating a paged collection', () => {
      const baseUri = 'http://example.com/test';
      const result = service.createPagedCollection(sampleActivities, 2, baseUri);
      
      expect(result).toBeDefined();
      expect(result.type).toBe('Collection');
      expect(result.first).toBeDefined();
    });
  });
});
