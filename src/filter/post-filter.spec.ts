import { Test, TestingModule } from '@nestjs/testing';
import { PostFilter } from './post-filter';

describe('PostFilter', () => {
  let provider: PostFilter;
  
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostFilter],
    }).compile();
    provider = module.get<PostFilter>(PostFilter);
  });
  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
