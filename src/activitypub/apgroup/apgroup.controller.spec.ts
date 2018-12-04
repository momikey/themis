import { Test, TestingModule } from '@nestjs/testing';
import { ApgroupController } from './apgroup.controller';
import { ApgroupService } from './apgroup.service';
import { Group } from '../../group/group.entity';
import { GroupActorHelper } from '../group-actor.helper';

class GroupServiceMock {
  async findAll(): Promise<any> {
    return [];
  }
}

class GroupActorMock {
  groupActorFromEntity(entity: Group) {
    return {};
  }
}

describe('Apgroup Controller', () => {
  let module: TestingModule;
  
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [ApgroupController],
      providers: [
        { provide: ApgroupService, useClass: GroupServiceMock },
        { provide: GroupActorHelper, useClass: GroupActorMock }
      ]
    }).compile();
  });
  it('should be defined', () => {
    const controller: ApgroupController = module.get<ApgroupController>(ApgroupController);
    expect(controller).toBeDefined();
  });
});
