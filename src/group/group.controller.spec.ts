import { Test, TestingModule } from '@nestjs/testing';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';

class GroupServiceMock {
  async findAll(): Promise<any> {
    return [];
  }
}

describe('Group Controller', () => {
  let module: TestingModule;
  
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [GroupController],
      providers: [{
        provide: GroupService,
        useClass: GroupServiceMock
      }]
    }).compile();
  });
  it('should be defined', () => {
    const controller: GroupController = module.get<GroupController>(GroupController);
    expect(controller).toBeDefined();
  });
});
