import { Test, TestingModule } from '@nestjs/testing';
import { PreferenceService } from './preference.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Preference } from './preference.entity';
import { Repository } from 'typeorm';

describe('PreferenceService', () => {
  let service: PreferenceService;
  
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PreferenceService,
        { provide: getRepositoryToken(Preference), useClass: Repository }
      ],
    }).compile();
    service = module.get<PreferenceService>(PreferenceService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
