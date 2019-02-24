import { Test, TestingModule } from '@nestjs/testing';
import { ApPostService } from './ap-post.service';
import { PostService } from '../../post/post.service';
import { ConfigService } from '../../config/config.service';

jest.mock('../../post/post.service');
jest.mock('../../config/config.service');

describe('ApPostService', () => {
  let service: ApPostService;
  
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApPostService,
        PostService,
        ConfigService
      ],
    }).compile();
    service = module.get<ApPostService>(ApPostService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
