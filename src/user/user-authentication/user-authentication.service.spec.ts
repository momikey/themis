import { Test, TestingModule } from '@nestjs/testing';
import { UserAuthenticationService } from './user-authentication.service';
import { UserService } from '../user.service';
import { UserAuthentication } from './user-authentication.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '../../config/config.service';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { Repository } from 'typeorm/repository/Repository';
import { async } from 'rxjs/internal/scheduler/async';
import { JwtPayload } from './jwt.interface';
import { LoginDto } from './login.dto';
import { CreateAccountDto } from './create-account.dto';
import { User } from '../user.entity';
import * as bcrypt from 'bcrypt';
import { UserRole } from './user-authentication.role';

jest.mock('../user.service');
jest.mock('@nestjs/jwt/dist/jwt.service');
jest.mock('typeorm/repository/Repository');

jest.mock('bcrypt');
const mockBcryptCompare = jest.spyOn(bcrypt, 'compare');
const mockBcryptHash = jest.spyOn(bcrypt, 'hash');

jest.mock('../../config/config.service');
const ConfigServiceMock = <jest.Mock<ConfigService>>ConfigService;
ConfigServiceMock.mockImplementation(() => {
  return {
    serverAddress: 'example.com',
    serverPort: 80
  }
});

describe('UserAuthenticationService', () => {
  let service: UserAuthenticationService;
  let repository: jest.Mocked<Repository<UserAuthentication>>;
  let jwtService: jest.Mocked<JwtService>;
  let userService: jest.Mocked<UserService>;
  let configService: jest.Mocked<ConfigService>;
  
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAuthenticationService,
        UserService,
        JwtService,
        { provide: ConfigService, useClass: ConfigServiceMock },
        { provide: getRepositoryToken(UserAuthentication), useClass: Repository }
      ],
    }).compile();

    service = module.get<UserAuthenticationService>(UserAuthenticationService);
    repository = module.get<Repository<UserAuthentication>>(
      getRepositoryToken(UserAuthentication)) as jest.Mocked<Repository<UserAuthentication>>;
    jwtService = module.get<JwtService>(JwtService) as jest.Mocked<JwtService>;
    userService = module.get<UserService>(UserService) as jest.Mocked<UserService>;
    configService = module.get<ConfigService>(ConfigService) as jest.Mocked<ConfigService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(configService).toBeDefined();
    expect(repository).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  it('should have configuation values', () => {
    expect(configService).toBeDefined();
    expect(configService.serverAddress).toBeDefined();
    expect(configService.serverAddress).toBe('example.com');
    expect(configService.serverPort).toBeDefined();
    expect(configService.serverPort).toBe(80);
  });

  describe('Method testing', () => {
    // Sample JWT payload for later use.
    const payload: JwtPayload = {
      username: 'user',
      email: 'user@example.com'
    };

    // Sample login object for later use.
    const login: LoginDto = {
      username: 'user',
      password: '12345'
    };

    // Sample "new account" object for later use.
    const newAccount: CreateAccountDto = {
      username: 'user',
      password: '12345',
      email: 'user@example.com'
    };

    const sampleUserData: User = {
        id: 1,
        name: 'user',
        displayName: 'A user',
        server: 'example.com',
        summary: '',
        icon: '',
        posts: [],
        date: ''
    };

    const sampleAuthentication: UserAuthentication = {
      id: 1,
      user: sampleUserData,
      email: 'user@example.com',
      password: 'secret',
      reset: false,
      token: '',
      role: UserRole.User
    };

    beforeAll(() => {
      jwtService.sign.mockReturnValue('secret');
      userService.findByName.mockReturnValue(sampleUserData);

      repository.findOneOrFail.mockReturnValue(sampleAuthentication);
      repository.findOne.mockReturnValue(sampleAuthentication);
      repository.save.mockImplementation((entity) => entity);
      repository.create.mockImplementation((entity) => Object.assign(new UserAuthentication, entity));

      mockBcryptCompare.mockReturnValue(true);
      mockBcryptHash.mockReturnValue(Promise.resolve('secret'));
    });

    it('creating an API token should return a valid token', async () => {
      const result = await service.createToken(payload);

      expect(result).toBeDefined();
      expect(result.expiresIn).toBe(3600);
      expect(result.accessToken).toBe('secret');
    });

    it('creating a login token should return a valid token', async () => {
      const result = await service.createLoginToken(login);      

      expect(result).toBeDefined();
      expect(result.expiresIn).toBe(3600*24);
      expect(result.accessToken).toBe('secret');
    });

    it('validating a user should check username and email', async () => {
      const result = await service.validateUser(payload);

      expect(result).toBeDefined();
      expect(result).toBe(true);
    });

    it('validating an account should check that the account exists', async () => {
      userService.findByName.mockReturnValueOnce(undefined);
      const result = await service.validateAccount(newAccount);

      expect(result).toBeDefined();
      expect(result).toBe(true);
    });

    it('validating a login should check that the username exists and the password matches', 
      async () => {
        const result = await service.validateLogin(login);

        expect(result).toBeDefined();
        expect(result.id).toBe(1);
    });

    it('creating an account should return a new, valid authentication object', async () => {
      userService.findByName.mockReturnValueOnce(undefined);
      userService.createEmptyUserEntry.mockImplementation((name: string) => {
        const entity = new User;
        entity.name = name;
        return entity;
      });

      const result = await service.createAccount(newAccount);

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(UserAuthentication);
      expect(result.email).toBe('user@example.com');
    });

    it("getting a user's role should return the proper value and type", async () => {
      const result = await service.getUserRole('user');

      expect(result).toBeDefined();
      expect(result).toBe(UserRole.User);
    });
  });
});
