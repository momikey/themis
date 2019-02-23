import { Test, TestingModule } from '@nestjs/testing';
import { ApUserController } from './ap-user.controller';
import { ApUserService } from './ap-user.service';
import { ConfigService } from '../../config/config.service';
import { MethodNotAllowedException } from '@nestjs/common';

jest.mock('./ap-user.service');
jest.mock('../../config/config.service');

describe('ApUser Controller', () => {
  let module: TestingModule;
  let controller: ApUserController;
  let service: jest.Mocked<ApUserService>;
  let configService: jest.Mocked<ConfigService>;
  
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [ApUserController],
      providers: [
        ApUserService,
        ConfigService
      ]
    }).compile();

    controller = module.get<ApUserController>(ApUserController);
    service = module.get<ApUserService>(ApUserService) as jest.Mocked<ApUserService>;
    configService = module.get<ConfigService>(ConfigService) as jest.Mocked<ConfigService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should connect to services', () => {
    expect(service).toBeDefined();
    expect(configService).toBeDefined();
  });

  it('non-federated servers should not allow posting to inbox', async () => {
      try {
        const result = await controller.postToInbox('test', undefined);
      } catch (e) {
        expect(e).toBeDefined();
        expect(e).toBeInstanceOf(MethodNotAllowedException);
      }
  });
});
