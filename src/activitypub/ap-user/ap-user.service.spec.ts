import { Test, TestingModule } from '@nestjs/testing';
import { ApUserService } from './ap-user.service';
import { UserService } from '../../user/user.service';
import { User } from '../../user/user.entity';
import { AP } from '../definitions/constants';
import { ConfigService } from '../../config/config.service';
import { ActivityService } from '../activity/activity.service';
import { PostObject } from '../definitions/activities/post-object';
import { ApPostService } from '../ap-post/ap-post.service';
import { Server } from '../../server/server.entity';
import { Activity } from '../definitions/activities/activity.entity';
import { UserAuthenticationService } from '../../user/user-authentication/user-authentication.service';

jest.mock('../../user/user.service');
jest.mock('../../config/config.service');
jest.mock('../activity/activity.service');
jest.mock('../ap-post/ap-post.service');
jest.mock('../../user/user-authentication/user-authentication.service');

describe('ApUserService', () => {
  let service: ApUserService;
  let userService: jest.Mocked<UserService>;
  let configService: jest.Mocked<ConfigService>;
  let apPostService: jest.Mocked<ApPostService>;
  let activityService: jest.Mocked<ActivityService>;
  
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApUserService,
        UserService,
        ConfigService,
        ApPostService,
        ActivityService,
        UserAuthenticationService
      ],
    }).compile();

    service = module.get<ApUserService>(ApUserService);
    userService = module.get<UserService>(UserService) as jest.Mocked<UserService>;
    configService = module.get<ConfigService>(ConfigService) as jest.Mocked<ConfigService>;
    apPostService = module.get<ApPostService>(ApPostService) as jest.Mocked<ApPostService>;
    activityService = module.get<ActivityService>(ActivityService) as jest.Mocked<ActivityService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should connect to services', () => {
    expect(userService).toBeDefined();
  });

  describe('Method testing', () => {
    // A sample post object, which we'll use later.
    const postObject: PostObject = {
      '@context': AP.Context,
      type: 'Article',
      attributedTo: 'https://example.com/user/sample',
      summary: 'Test post',
      content: 'This is a test',
      to: ['https://example.com/group/test']
    }
    // Define some test activities, so we don't have to keep doing it.
    const activities = {
      create: {
        '@context': AP.Context,
        type: 'Create',
        object: postObject,
        to: ['https://example.com/group/test']
      }
    }

    beforeAll(() => {
      userService.findLocalByName.mockResolvedValue(Object.assign(new User, {
        id: 1,
        name: 'user',
        server: Object.assign(new Server, {host: 'example.com', scheme: 'http'}),
        displayName: 'A user',
        summary: 'A user for testing',
        icon: '',
        posts: [],
        date: (new Date).toDateString()
      }));
    });

    it('getting a local user should return a valid object', async () => {
      const result = await service.getLocalUser('user');

      expect(result).toBeDefined();
      expect(result).toEqual(expect.any(User));
      expect(result.name).toBe('user');
    });

    it('getting the actor object should return a proper value', async () => {
      const result = await service.getActorForUser('user');

      expect(result).toBeDefined();
      expect(result['@context']).toBe(AP.Context);
      expect(result.id).toMatch(/http:/);
    });

    describe('Posting to outbox', () => {
      beforeAll(() => {
        const { ApPostService } = jest.requireActual('../ap-post/ap-post.service');
        const ap = new ApPostService();
        apPostService.createNewGlobalPost.mockImplementation(ap.createNewGlobalPost);

        activityService.save.mockResolvedValue({ activityObject: undefined } as Activity);
      });

      it('bare object', async () => {
        const result = await service.acceptPostRequest('sample', postObject);
        
        // expect(result).toBeDefined();
        // expect(result.sender).toEqual({ name: 'sample', server: 'example.com'});
        // expect(result.groups).toHaveLength(1);
        // expect(result.groups[0]).toEqual({ name: 'test', server: 'example.com'});
      });

      it('Create activity', async () => {
        const result = await service.acceptPostRequest('sample', activities.create);

        // expect(result).toBeDefined();
        // expect(result.sender).toEqual({ name: 'sample', server: 'example.com'});
        // expect(result.groups).toHaveLength(1);
        // expect(result.groups[0]).toEqual({ name: 'test', server: 'example.com'});
      });
    });
  });
});
