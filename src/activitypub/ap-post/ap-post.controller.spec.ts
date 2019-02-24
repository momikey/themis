import { Test, TestingModule } from '@nestjs/testing';
import { ApPostController } from './ap-post.controller';

describe('ApPost Controller', () => {
  let module: TestingModule;
  
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [ApPostController],
    }).compile();
  });
  it('should be defined', () => {
    const controller: ApPostController = module.get<ApPostController>(ApPostController);
    expect(controller).toBeDefined();
  });
});
