import { Test, TestingModule } from '@nestjs/testing';
import { ActivityService } from './activity.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Activity } from '../definitions/activities/activity.entity';
import { Repository } from 'typeorm/repository/Repository';
import { GroupService } from '../../group/group.service';
import { UserService } from '../../user/user.service';
import { PostService } from '../../post/post.service';
import { ConfigService } from '../../config/config.service';

jest.mock('../../group/group.service');
jest.mock('../../user/user.service');
jest.mock('../../post/post.service');

jest.mock('../../config/config.service');
jest.mock('typeorm/repository/Repository');

describe('ActivityService', () => {
  let service: ActivityService;
  let groupService: jest.Mocked<GroupService>
  let userService: jest.Mocked<UserService>;
  let postService: jest.Mocked<PostService>;
  let configService: jest.Mocked<ConfigService>;
  let repository: jest.Mocked<Repository<Activity>>;
  
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityService,
        GroupService,
        UserService,
        PostService,
        ConfigService,
        { provide: getRepositoryToken(Activity), useClass: Repository }
      ],
    }).compile();

    service = module.get<ActivityService>(ActivityService);
    groupService = module.get<GroupService>(GroupService) as jest.Mocked<GroupService>;
    userService = module.get<UserService>(UserService) as jest.Mocked<UserService>;
    postService = module.get<PostService>(PostService) as jest.Mocked<PostService>;
    configService = module.get<ConfigService>(ConfigService) as jest.Mocked<ConfigService>;
    repository = module.get<Repository<Activity>>(getRepositoryToken(Activity)) as
      jest.Mocked<Repository<Activity>>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should connect to services', () => {
    expect(groupService).toBeDefined();
    expect(userService).toBeDefined();
    expect(postService).toBeDefined();
    expect(configService).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('Method testing', () => {
    beforeAll(() => {

    });

    it('parsing a URI should work', () => {
      const uri = 'https://example.com/user/somebody';

      const result = service.parseSender(uri);
      
      expect(result).toBeDefined();
      expect(result.sender).toBe('somebody');
      expect(result.server).toBe('example.com');
    });

    it('parsing a list of groups should work', () => {
      const targets = [
        'https://example.com/group/abc',
        'https://example.com/group/def',
        'https://example.com/user/somebody',
        'https://foreign.invalid/group/whatever'
      ];

      const result = service.parseGroups(targets);

      expect(result).toBeDefined();
      expect(result.length).toBe(3);
    });
  });
});
