import { Test, TestingModule } from '@nestjs/testing';
import { NodeinfoController } from './nodeinfo.controller';
import { UserAuthenticationService } from '../../user/user-authentication/user-authentication.service';
import { PostService } from '../../post/post.service';
import { ConfigService } from '../../config/config.service';

jest.mock('../../user/user-authentication/user-authentication.service');
jest.mock('../../post/post.service');
jest.mock('../../config/config.service');

describe('Nodeinfo Controller', () => {
  let module: TestingModule;
  let controller: NodeinfoController;
  let authService: jest.Mocked<UserAuthenticationService>;
  let postService: jest.Mocked<PostService>;
  let configService: jest.Mocked<ConfigService>;
  
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [NodeinfoController],
      providers: [
        PostService,
        UserAuthenticationService,
        ConfigService
      ]
    }).compile();

    controller = module.get<NodeinfoController>(NodeinfoController);
    authService = module.get<UserAuthenticationService>(UserAuthenticationService) as 
      jest.Mocked<UserAuthenticationService>;
    postService = module.get<PostService>(PostService) as jest.Mocked<PostService>;
    configService = module.get<ConfigService>(ConfigService) as jest.Mocked<ConfigService>;

  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should connect to services', () => {
    expect(authService).toBeDefined();
    expect(postService).toBeDefined();
    expect(configService).toBeDefined();
  });

  it('should provide a valid NodeInfo object', async () => {
    authService.count.mockReturnValue(1);
    authService.countActiveSince.mockReturnValue(42);
    postService.countLocal.mockReturnValue(444);

    const result = await controller.getNodeInfo();

    expect(result).toBeDefined();
    expect(result.version).toBe('2.1');
    expect(result.software.name).toBe('themis');
    expect(result.software.version).toMatch(/\d+\.\d+\.\d+/);
    expect(result.openRegistrations).toEqual(expect.any(Boolean));
    expect(result.protocols).toContain('activitypub');
    expect(result.usage.users.total).toEqual(expect.any(Number));
    expect(result.usage.users.activeHalfYear).toEqual(expect.any(Number));
    expect(result.usage.users.activeMonth).toEqual(expect.any(Number));
    expect(result.usage.localPosts).toEqual(expect.any(Number));
    expect(result.metadata).toBeDefined();
  });
});
