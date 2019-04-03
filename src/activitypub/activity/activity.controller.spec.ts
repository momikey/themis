import { Test, TestingModule } from '@nestjs/testing';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';

jest.mock('./activity.service');

describe('Activity Controller', () => {
  let module: TestingModule;
  
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [ActivityController],
      providers: [
        ActivityService
      ]
    }).compile();
  });
  it('should be defined', () => {
    const controller: ActivityController = module.get<ActivityController>(ActivityController);
    expect(controller).toBeDefined();
  });
});
