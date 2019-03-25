import { FederationGuard } from './federation.guard';
import { TestingModule, Test } from '@nestjs/testing';
import { ConfigService } from '../config/config.service';
import { ServerService } from '../server/server.service';

jest.mock('../server/server.service');
jest.mock('../config/config.service');


describe('FederationGuard', () => {
  let guard: FederationGuard;

  beforeAll(async () => {

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FederationGuard,
        ConfigService,
        ServerService
      ],
    }).compile();

    guard = module.get<FederationGuard>(FederationGuard);

  });

  it('should be defined', () => {
    expect(guard).toBeTruthy();
  });
});
