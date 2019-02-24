import { Test, TestingModule } from '@nestjs/testing';
import { ApPostController } from './ap-post.controller';
import { ApPostService } from './ap-post.service';

jest.mock('./ap-post.service');

describe('ApPost Controller', () => {
  let module: TestingModule;
  
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [ApPostController],
      providers: [
        ApPostService
      ]
    }).compile();
  });
  it('should be defined', () => {
    const controller: ApPostController = module.get<ApPostController>(ApPostController);
    expect(controller).toBeDefined();
  });
});
