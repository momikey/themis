import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('PostService', () => {
  let service: PostService;
  
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        { provide: getRepositoryToken(Post), useClass: Repository }
      ],
    }).compile();
    service = module.get<PostService>(PostService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
