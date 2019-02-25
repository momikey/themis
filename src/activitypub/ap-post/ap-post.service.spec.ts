import { Test, TestingModule } from '@nestjs/testing';
import { ApPostService } from './ap-post.service';
import { PostService } from '../../post/post.service';
import { ConfigService } from '../../config/config.service';
import { ActivityService } from '../activity/activity.service';

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
});
