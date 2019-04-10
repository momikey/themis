import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from './authentication.controller';
import { UserAuthenticationService } from '../../user/user-authentication/user-authentication.service';

jest.mock('../../user/user-authentication/user-authentication.service');

describe('Authentication Controller', () => {
  let module: TestingModule;
  
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        UserAuthenticationService
      ]
    }).compile();
  });
  it('should be defined', () => {
    const controller: AuthenticationController = module.get<AuthenticationController>(AuthenticationController);
    expect(controller).toBeDefined();
  });
});
