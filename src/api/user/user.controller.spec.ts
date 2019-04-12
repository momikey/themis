import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../../user/user.service';
import { UserAuthenticationService } from '../../user/user-authentication/user-authentication.service';

jest.mock('../../user/user.service');
jest.mock('../../user/user-authentication/user-authentication.service');

describe('User Controller', () => {
  let module: TestingModule;
  
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        UserAuthenticationService
      ]
    }).compile();
  });
  it('should be defined', () => {
    const controller: UserController = module.get<UserController>(UserController);
    expect(controller).toBeDefined();
  });
});
