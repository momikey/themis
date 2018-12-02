import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService, EnvConfig } from './config.service';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

class DotEnvMock {
  parse(env: string): EnvConfig {
    return {};
  }
}

class FsMock {
  readFileSync(fn: string): string {
    return '';
  }
}

describe('ConfigService', () => {
  let service: ConfigService;
  
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        { provide: dotenv, useClass: DotEnvMock },
        { provide: fs, useClass: FsMock }
      ],
    }).compile();
    service = module.get<ConfigService>(ConfigService);
  });
  // it('should be defined', () => {
  //   expect(service).toBeDefined();
  // });
});
