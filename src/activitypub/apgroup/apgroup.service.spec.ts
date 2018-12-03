import { Test, TestingModule } from '@nestjs/testing';
import { ApgroupService } from './apgroup.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Group } from '../../group/group.entity';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/common';

class HttpServiceMock {
}

describe('ApgroupService', () => {
  let service: ApgroupService;
  
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApgroupService,
        { provide: getRepositoryToken(Group), useClass: Repository },
        { provide: HttpService, useClass: HttpServiceMock }
      ],
    }).compile();
    service = module.get<ApgroupService>(ApgroupService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
