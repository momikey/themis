import { Test, TestingModule } from '@nestjs/testing';
import { ServerService } from './server.service';
import { ConfigService } from '../config/config.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server } from './server.entity';

jest.mock('typeorm/repository/Repository'); 
jest.mock('../config/config.service');

describe('ServerService', () => {
  let service: ServerService;
  let repository = new Repository<Server>();
  jest.spyOn(repository, 'create').mockReturnValue({});
  jest.spyOn(repository, 'findOneOrFail').mockResolvedValue(true);
  
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServerService,
        ConfigService,
        { provide: getRepositoryToken(Server), useValue: repository }
      ],
    }).compile();

    service = module.get<ServerService>(ServerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
