import { Test, TestingModule } from '@nestjs/testing';
import { UserAuthenticationController } from './user-authentication.controller';
import { UserAuthenticationService } from './user-authentication.service';
import { CreateAccountDto } from './create-account.dto';
import { JwtPayload } from './jwt.interface';
import { Account } from './account.entity';
import { LoginDto } from './login.dto';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

jest.mock('./user-authentication.service');

describe('UserAuthentication Controller', () => {
  let module: TestingModule;
  let controller: UserAuthenticationController;
  let service: jest.Mocked<UserAuthenticationService>;
  
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [UserAuthenticationController],
      providers: [UserAuthenticationService]
    }).compile();

    service = module.get<UserAuthenticationService>(UserAuthenticationService) as jest.Mocked<UserAuthenticationService>;
    controller = module.get<UserAuthenticationController>(UserAuthenticationController);
  });

  it('should be defined', () => {
    const controller: UserAuthenticationController = module.get<UserAuthenticationController>(UserAuthenticationController);
    expect(controller).toBeDefined();
  });

  it('successfully connects to the service', async () => {
    expect(controller.createAccount).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('Method testing', () => {
    beforeAll(() => {
      service.createToken.mockImplementation(async (user: JwtPayload) => {
        return { expiresIn: 1000, accessToken: 'secret' };
      });

      service.createAccount.mockImplementation(async (user: CreateAccountDto) => 
        Object.assign(new Account, user)
      );

      service.validateLogin.mockImplementation(async (user: LoginDto) => new Account);

      service.createLoginToken.mockImplementation(async (user: LoginDto) => {
        return { expiresIn: 1000, accessToken: 'secret' };
      })
    });

    it('creating a token should return a valid token object', async () => {
      const result = await controller.createToken({ username: 'user', email: 'user@example.com' });

      expect(result).toBeDefined();
      expect(result.expiresIn).toBeDefined();
      expect(result.accessToken).toBeDefined();
    });

    it('creating a new account should return a valid authentication object', async () => {
      const result = await controller.createAccount({
        username: 'user',
        email: 'user@example.com',
        password: 'secret'
      });

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Account);
      expect(result.email).toBe('user@example.com');
    });

    it('verifying a login should return a valid token object', async () => {
      const result = await controller.verifyLogin({ username: 'user', password: 'secret' });

      expect(result).toBeDefined();
      expect(result).toMatchObject({ expiresIn: 1000, accessToken: 'secret'});
    });
  });

  describe('Error handling', () => {
    beforeAll(() => {

    });

    it('trying to create an existing account should fail with 400 Bad Request', async () => {
      service.createAccount.mockImplementation(async (user: CreateAccountDto) => 
        (user.username === 'good'
          ? new Account
          : Promise.reject())
      );

      const goodData: CreateAccountDto = {
        username: 'good',
        email: 'user@example.com',
        password: 'secret'
      };

      const badData: CreateAccountDto = {
        username: 'bad',
        email: 'user@example.com',
        password: 'secret'
      };

      const goodResult = await controller.createAccount(goodData);
      
      expect(goodResult).toBeDefined();
      expect(goodResult).toBeInstanceOf(Account);

      try {
        const badResult = await controller.createAccount(badData);
      } catch (e) {
        expect(e).toBeDefined();
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });

    it('incorrect login should fail with an appropriate status code', async () => {
      service.validateLogin.mockImplementation((login: LoginDto) => 
        (login.username === 'good' && login.password === 'secret'
        ? Promise.resolve(new Account)
        : Promise.reject(false)
        )
      );

      service.createLoginToken.mockImplementation(async () => {
        return { expiresIn: 1000, accessToken: ''}
      });

      const goodData: LoginDto = {
        username: 'good',
        password: 'secret'
      };

      const badUsername: LoginDto = {
        username: 'bad',
        password: 'secret'
      };

      const badPassword: LoginDto = {
        username: 'good',
        password: '12345'
      };

      const goodResult = await controller.verifyLogin(goodData);
      expect(goodResult).toBeDefined();
      expect(goodResult).toMatchObject({ expiresIn: 1000, accessToken: ''});
      
      try {
        const badResult1 = await controller.verifyLogin(badUsername);
      } catch (e) {
        expect(e).toBeDefined();
        expect(e).toBeInstanceOf(UnauthorizedException);
      }

      try {
        const badResult2 = await controller.verifyLogin(badPassword);
      } catch (e) {
        expect(e).toBeDefined();
        expect(e).toBeInstanceOf(UnauthorizedException);
      }
    });
  });
});
