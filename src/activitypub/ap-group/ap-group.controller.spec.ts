import { Test, TestingModule } from '@nestjs/testing';
import { ApGroupController } from './ap-group.controller';
import { ApGroupService } from './ap-group.service';
import { ConfigService } from '../../config/config.service';
import { FederationGuard } from '../federation.guard';

jest.mock('./ap-group.service');
jest.mock('../../config/config.service');
jest.mock('../federation.guard');

describe('ApGroup Controller', () => {
  let module: TestingModule;
  let controller: ApGroupController;
  let service: jest.Mocked<ApGroupService>;
  let configService: jest.Mocked<ConfigService>;
  
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [ApGroupController],
      providers: [
        ApGroupService,
        ConfigService,
        FederationGuard
      ]
    }).compile();

    controller = module.get<ApGroupController>(ApGroupController);
    service = module.get<ApGroupService>(ApGroupService) as jest.Mocked<ApGroupService>;
    configService = module.get<ConfigService>(ConfigService) as jest.Mocked<ConfigService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should connect to services', () => {
    expect(service).toBeDefined();
    expect(configService).toBeDefined();
  });
  
  describe('Method testing', () => {
    beforeAll(() => {

    });

    it("fetching a group's following list should return an empty OrderedCollection", async () => {
      const result = await controller.getFollowing('group');

      expect(result).toBeDefined();
      expect(result.type).toBe('OrderedCollection');
      expect(result.totalItems).toBe(0);
    });
  });
});
