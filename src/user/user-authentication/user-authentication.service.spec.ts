import { Test, TestingModule } from '@nestjs/testing';
import { UserAuthenticationService } from './user-authentication.service';
import { UserService } from '../user.service';
import { JwtService } from '@nestjs/jwt';
import { UserAuthentication } from './user-authentication.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '../../config/config.service';

class UserServiceMock {

}

class JwtServiceMock {

}

class ConfigMock {

}

describe('UserAuthenticationService', () => {
  let service: UserAuthenticationService;
  
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAuthenticationService,
        { provide: UserService, useClass: UserServiceMock },
        { provide: JwtService, useClass: JwtServiceMock },
        { provide: ConfigService, useClass: ConfigMock },
        { provide: getRepositoryToken(UserAuthentication), useClass: Repository }
      ],
    }).compile();
    service = module.get<UserAuthenticationService>(UserAuthenticationService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
