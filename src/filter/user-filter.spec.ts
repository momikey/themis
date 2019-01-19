import { Test, TestingModule } from '@nestjs/testing';
import { UserFilter } from './user-filter';

describe('UserFilter', () => {
  let provider: UserFilter;
  
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserFilter],
    }).compile();
    provider = module.get<UserFilter>(UserFilter);
  });
  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
