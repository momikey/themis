import { Test, TestingModule } from '@nestjs/testing';
import { ApUserController } from './ap-user.controller';
import { ApUserService } from './ap-user.service';

jest.mock('./ap-user.service');

describe('ApUser Controller', () => {
  let module: TestingModule;
  let controller: ApUserController;
  let service: jest.Mocked<ApUserService>;
  
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [ApUserController],
      providers: [
        ApUserService
      ]
    }).compile();

    controller = module.get<ApUserController>(ApUserController);
    service = module.get<ApUserService>(ApUserService) as jest.Mocked<ApUserService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should connect to services', () => {
    expect(service).toBeDefined();
  });
});
