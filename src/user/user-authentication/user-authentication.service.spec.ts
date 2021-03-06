import { Test, TestingModule } from '@nestjs/testing';
import { UserAuthenticationService } from './user-authentication.service';
import { UserService } from '../user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '../../config/config.service';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { Repository } from 'typeorm/repository/Repository';
import { JwtPayload } from './jwt.interface';
import * as bcrypt from 'bcrypt';
import { UserRole } from './user-authentication.role';
import { Account } from '../../entities/account.entity';
import { LoginDto } from '../../dtos/login.dto';
import { CreateAccountDto } from '../../dtos/create-account.dto';
import { User } from '../../entities/user.entity';
import { Server } from '../../entities/server.entity';

jest.mock('../user.service');
jest.mock('@nestjs/jwt/dist/jwt.service');
jest.mock('typeorm/repository/Repository');

jest.mock('bcrypt');
const mockBcryptCompare = jest.spyOn(bcrypt, 'compare');
const mockBcryptHash = jest.spyOn(bcrypt, 'hash');

jest.mock('../../config/config.service');
const ConfigServiceMock = <jest.Mock<ConfigService>>ConfigService as any;
ConfigServiceMock.mockImplementation(() => {
  return {
    serverAddress: 'example.com',
    serverPort: 80
  }
});

describe('UserAuthenticationService', () => {
  let service: UserAuthenticationService;
  let repository: jest.Mocked<Repository<Account>>;
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
        { provide: getRepositoryToken(Account), useClass: Repository }
      ],
    }).compile();

    service = module.get<UserAuthenticationService>(UserAuthenticationService);
    repository = module.get<Repository<Account>>(
      getRepositoryToken(Account)) as jest.Mocked<Repository<Account>>;
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

    const sampleUserData = Object.assign(new User, {
        id: 1,
        name: 'user',
        displayName: 'A user',
        summary: '',
        icon: '',
        date: '',
        uri: '',
        server: Object.assign(new Server(), {
          host: 'example.com',
        })
    });

    const sampleAuthentication = Object.assign(new Account, {
      id: 1,
      user: sampleUserData,
      email: 'user@example.com',
      password: 'secret',
      reset: false,
      token: '',
      role: UserRole.User,
      lastLoggedIn: new Date
    });

    beforeAll(() => {
      jwtService.sign.mockReturnValue('secret');
      userService.findByName.mockResolvedValue(sampleUserData);

      repository.findOneOrFail.mockResolvedValue(sampleAuthentication);
      repository.findOne.mockResolvedValue(sampleAuthentication);
      repository.save.mockImplementation(async (entity) => entity as Account);
      repository.create.mockImplementation((entity) => Object.assign(new Account, entity));

      mockBcryptCompare.mockResolvedValue(true);
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
      userService.createEmptyUserEntry.mockImplementation(async (name: string) => {
        const entity = new User;
        entity.name = name;
        return entity;
      });

      const result = await service.createAccount(newAccount);

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Account);
      expect(result.email).toBe('user@example.com');
    });

    it("getting a user's role should return the proper value and type", async () => {
      const result = await service.getUserRole('user');

      expect(result).toBeDefined();
      expect(result).toBe(UserRole.User);
    });
  });
});
