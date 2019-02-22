import { Test, TestingModule } from '@nestjs/testing';
import { ApGroupController } from './ap-group.controller';
import { ApGroupService } from './ap-group.service';

jest.mock('./ap-group.service');

describe('ApGroup Controller', () => {
  let module: TestingModule;
  let controller: ApGroupController;
  let service: jest.Mocked<ApGroupService>;
  
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [ApGroupController],
      providers: [
        ApGroupService
      ]
    }).compile();

    controller = module.get<ApGroupController>(ApGroupController);
    service = module.get<ApGroupService>(ApGroupService) as jest.Mocked<ApGroupService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should connect to services', () => {
    expect(service).toBeDefined();
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
