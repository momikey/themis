import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from '../../post/post.service';

jest.mock('../../post/post.service');

describe('Post Controller', () => {
  let module: TestingModule;
  
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [PostController],
      providers: [
        PostService
      ]
    }).compile();
  });
  it('should be defined', () => {
    const controller: PostController = module.get<PostController>(PostController);
    expect(controller).toBeDefined();
  });
});
