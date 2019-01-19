import { Test, TestingModule } from '@nestjs/testing';
import { GroupFilter } from './group-filter';

describe('GroupFilter', () => {
  let provider: GroupFilter;
  
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupFilter],
    }).compile();
    provider = module.get<GroupFilter>(GroupFilter);
  });
  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
