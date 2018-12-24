import { Test, TestingModule } from '@nestjs/testing';
import { UserAuthenticationController } from './user-authentication.controller';
import { UserAuthenticationService } from './user-authentication.service';

class AuthServiceMock {

}

describe('UserAuthentication Controller', () => {
  let module: TestingModule;
  
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [UserAuthenticationController],
      providers: [{
        provide: UserAuthenticationService,
        useClass: AuthServiceMock
      }]
    }).compile();
  });
  it('should be defined', () => {
    const controller: UserAuthenticationController = module.get<UserAuthenticationController>(UserAuthenticationController);
    expect(controller).toBeDefined();
  });
});
