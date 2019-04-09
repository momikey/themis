import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from './authentication.controller';

describe('Authentication Controller', () => {
  let module: TestingModule;
  
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [AuthenticationController],
    }).compile();
  });
  it('should be defined', () => {
    const controller: AuthenticationController = module.get<AuthenticationController>(AuthenticationController);
    expect(controller).toBeDefined();
  });
});
