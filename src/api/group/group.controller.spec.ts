import { Test, TestingModule } from '@nestjs/testing';
import { GroupController } from './group.controller';
import { GroupService } from '../../group/group.service';

jest.mock('../../group/group.service');

describe('Group Controller', () => {
  let module: TestingModule;
  
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [GroupController],
      providers: [
        GroupService
      ]
    }).compile();
  });
  it('should be defined', () => {
    const controller: GroupController = module.get<GroupController>(GroupController);
    expect(controller).toBeDefined();
  });
});
