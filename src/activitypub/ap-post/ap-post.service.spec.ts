import { Test, TestingModule } from '@nestjs/testing';
import { ApPostService } from './ap-post.service';
import { PostService } from '../../post/post.service';
import { ConfigService } from '../../config/config.service';
import { ActivityService } from '../activity/activity.service';
import { CreateActivity } from '../definitions/activities/create-activity';
import { AP } from '../definitions/constants';

jest.mock('../../post/post.service');
jest.mock('../../config/config.service');
jest.mock('../activity/activity.service');

describe('ApPostService', () => {
  let service: ApPostService;
  
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApPostService,
        PostService,
        ConfigService,
        ActivityService
      ],
    }).compile();
    service = module.get<ApPostService>(ApPostService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Method testing', () => {
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
  });
});
