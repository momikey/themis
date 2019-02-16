import { Test, TestingModule } from '@nestjs/testing';
import { NodeinfoController } from './nodeinfo.controller';

describe('Nodeinfo Controller', () => {
  let module: TestingModule;
  
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [NodeinfoController],
    }).compile();
  });
  it('should be defined', () => {
    const controller: NodeinfoController = module.get<NodeinfoController>(NodeinfoController);
    expect(controller).toBeDefined();
  });
});
