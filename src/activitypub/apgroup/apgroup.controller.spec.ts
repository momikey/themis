import { Test, TestingModule } from '@nestjs/testing';
import { ApgroupController } from './apgroup.controller';
import { ApgroupService } from './apgroup.service';

class GroupServiceMock {
  async findAll(): Promise<any> {
    return [];
  }
}

describe('Apgroup Controller', () => {
  let module: TestingModule;
  
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [ApgroupController],
      providers: [{
        provide: ApgroupService,
        useClass: GroupServiceMock
      }]
    }).compile();
  });
  it('should be defined', () => {
    const controller: ApgroupController = module.get<ApgroupController>(ApgroupController);
    expect(controller).toBeDefined();
  });
});
