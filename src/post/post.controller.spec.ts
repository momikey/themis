import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from './post.service';

class PostServiceMock {
  async findAll(): Promise<any> {
    return [];
  }
}

describe('Post Controller', () => {
  let module: TestingModule;
  
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [PostController],
      providers: [{
        provide: PostService,
        useClass: PostServiceMock
      }]
    }).compile();
  });
  it('should be defined', () => {
    const controller: PostController = module.get<PostController>(PostController);
    expect(controller).toBeDefined();
  });
});
