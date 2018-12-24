import { Test, TestingModule } from '@nestjs/testing';
import { UserAuthenticationService } from './user-authentication.service';
import { UserService } from '../user.service';
import { JwtService } from '@nestjs/jwt';

class UserServiceMock {

}

class JwtServiceMock {

}

describe('UserAuthenticationService', () => {
  let service: UserAuthenticationService;
  
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAuthenticationService,
        { provide: UserService, useClass: UserServiceMock },
        { provide: JwtService, useClass: JwtServiceMock }
      ],
    }).compile();
    service = module.get<UserAuthenticationService>(UserAuthenticationService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
