import { Test, TestingModule } from '@nestjs/testing';
import { ApUserService } from './ap-user.service';
import { UserService } from '../../user/user.service';
import { User } from '../../user/user.entity';
import { AP } from '../definitions/constants';

jest.mock('../../user/user.service');

describe('ApUserService', () => {
  let service: ApUserService;
  let userService: jest.Mocked<UserService>;
  
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApUserService,
        UserService
      ],
    }).compile();

    service = module.get<ApUserService>(ApUserService);
    userService = module.get<UserService>(UserService) as jest.Mocked<UserService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should connect to services', () => {
    expect(userService).toBeDefined();
  });

  describe('Method testing', () => {
    beforeAll(() => {
      userService.findLocalByName.mockReturnValue(Object.assign(new User, {
        id: 1,
        name: 'user',
        server: 'example.com',
        displayName: 'A user',
        summary: 'A user for testing',
        icon: '',
        posts: [],
        date: (new Date).toDateString()
      }));
    });

    it('getting a local user should return a valid object', async () => {
      const result = await service.getLocalUser('user');

      expect(result).toBeDefined();
      expect(result).toEqual(expect.any(User));
      expect(result.name).toBe('user');
    });

    it('getting the actor object should return a proper value', async () => {
      const result = await service.getActorForUser('user');

      expect(result).toBeDefined();
      expect(result['@context']).toBe(AP.Context);
      expect(result.id).toMatch(/https:/);
    });
  });
});
