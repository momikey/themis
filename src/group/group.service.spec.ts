import { Test, TestingModule } from '@nestjs/testing';
import { GroupService } from './group.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './group.entity';

describe('GroupService', () => {
  let service: GroupService;
  
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        { provide: getRepositoryToken(Group), useClass: Repository }
      ],
    }).compile();
    service = module.get<GroupService>(GroupService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
