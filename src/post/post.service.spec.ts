import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { Post } from './post.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '../config/config.service';
import { UserService } from '../user/user.service';
import { GroupService } from '../group/group.service';
import { Repository } from 'typeorm/repository/Repository';
import * as uuidv5 from 'uuid/v5';
import { CreatePostDto } from './create-post.dto';
import { CreateTopLevelPostDto } from './create-top-level-post.dto';
import { CreateReplyDto } from './create-reply.dto';
import { User } from '../user/user.entity';
import { Group } from '../group/group.entity';

jest.mock('../user/user.service');
jest.mock('../group/group.service');
jest.mock('typeorm/repository/Repository');

jest.mock('../config/config.service');
const ConfigServiceMock = <jest.Mock<ConfigService>>ConfigService;
ConfigServiceMock.mockImplementation(() => {
  return {
    serverAddress: 'example.com',
    serverPort: 80
  }
});

describe('PostService', () => {
  let service: PostService;
  let repository: jest.Mocked<Repository<Post>>;
  let userService: jest.Mocked<UserService>;
  let groupService: jest.Mocked<GroupService>;
  let configService: jest.Mocked<ConfigService>;
  
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        UserService,
        GroupService,
        { provide: getRepositoryToken(Post), useClass: Repository },
        { provide: ConfigService, useClass: ConfigServiceMock },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    repository = module.get<Repository<Post>>(getRepositoryToken(Post)) as jest.Mocked<Repository<Post>>;
    userService = module.get<UserService>(UserService) as jest.Mocked<UserService>;
    groupService = module.get<GroupService>(GroupService) as jest.Mocked<GroupService>;
    configService = module.get<ConfigService>(ConfigService) as jest.Mocked<ConfigService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
    expect(userService).toBeDefined();
    expect(groupService).toBeDefined();
    expect(configService).toBeDefined();
  });

  describe('Method testing', () => {
    const uuidFormat = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
    const sampleUuid = uuidv5('example.com', uuidv5.DNS);
    const samplePost: CreatePostDto = {
      sender: 'user',
      server: 'example.com',
      subject: 'Subject',
      parent: '',
      primaryGroup: 'group',
      ccGroups: [],
      content: 'This is a test',
      source: ''
    };
    const sampleTopLevel: CreateTopLevelPostDto = {
      sender: 'user',
      server: 'example.com',
      subject: 'Subject',
      primaryGroup: 'group',
      ccGroups: [],
      content: 'This is a test',
      source: ''
    };
    const sampleReply: CreateReplyDto = {
      sender: 'user',
      server: 'example.com',
      subject: 'Subject',
      group: 1,
      content: 'This is a test',
      source: ''
    };

    const data: Post[] = [
      {id: 1, uuid: sampleUuid, server: 'example.com', sender: new User, uri: '', parentUri: '',
        groups: [], subject: 'Subject', content: 'Content', source: '', timestamp: '',
        deleted: false, children: [], parent: undefined },
      {id: 2, uuid: '00000000-1234-5678-987654321cafe', server: 'example.com', sender: new User, 
        uri: '', parentUri: '', groups: [], subject: 'Subject', content: 'Content', 
        source: '', timestamp: '', deleted: false, children: [], parent: undefined }
    ];

    beforeAll(() => {
      userService.findByName.mockReturnValue(new User);
      groupService.findByIds.mockReturnValue([new Group]);

      repository.create.mockImplementation((entity) => Object.assign(new Post, entity));
      repository.save.mockImplementation((entity) => entity);
      repository.findOne.mockImplementation((o: {uuid: string}) => 
        Object.assign(new Post, data.find((_) => _.uuid === o.uuid))
      );
      repository.remove.mockImplementation((entity) => Object.assign(new Post, entity));
      repository.find.mockImplementation(() => (
        data.map((e) => Object.assign(new Post, e))
      ));
    });

    it('create should create a post entity', async () => {
      const result = await service.create(samplePost);

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Post);
      expect(result.server).toBe(samplePost.server);
      expect(result.uuid.search(uuidFormat));
    });

    it('createTopLevel should create a top-level post entity (with empty parent)', async () => {
      const result = await service.createTopLevel(sampleTopLevel);

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Post);
      expect(result.parentUri).toBeFalsy();
    });

    it('createReply should create an entity representing a reply post', async () => {
      const result = await service.createReply(sampleReply, sampleUuid);

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Post);
      expect(result.parent).toBeDefined();
    });

    it('delete should return the deleted post', async () => {
      const result = await service.delete(sampleUuid);

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Post);
    });

    it('find all should return all posts', async () => {
      const result = await service.findAll();

      expect(result).toBeDefined();
      expect(result.length).toBeDefined()
      expect(result[0]).toBeInstanceOf(Post);
    });

    it('find by ID should return only the post with the given ID', async () => {
      const result = await service.find(1);

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Post);
    });

    /* TODO: These tests don't work yet. They all depend on the TreeRepository,
       which I'm not entirely sure how to mock. That'll have to wait for now.
    */
   /*
    it('find by UUID should return only the post with the given UUID', async () => {
      const result = await service.findByUuid(sampleUuid);

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Post);
    });

    it('find by User ID should return only posts belonging to that user', async () => {
      const result = await service.findByUserId(1);

      expect(result).toBeDefined();
      expect(result.length).toBeDefined();
      expect(result[0]).toBeInstanceOf(Post);
    });

    it('find by group name should return only posts in that group', async () => {
      const result = await service.findByGroup('group');

      expect(result).toBeDefined();
      expect(result.length).toBeDefined();
      expect(result[0]).toBeInstanceOf(Post);
    });

    it('find by Group ID should return only posts in that group', async () => {
      const result = await service.findByGroupId(1);

      expect(result).toBeDefined();
      expect(result.length).toBeDefined();
      expect(result[0]).toBeInstanceOf(Post);      
    });

    it('find top-level by group name should do just that', async () => {
      const result = await service.findTopLevelByGroup('group');

      expect(result).toBeDefined();
      expect(result.length).toBeDefined();
      expect(result[0]).toBeInstanceOf(Post);

    });

    it('count children should return a count of child posts', async () => {
      const result = await service.countChildren(data[0]);

      expect(result).toBeDefined();
      expect(result).toBe(0);
    });

    it('find children should return the child posts as a property of the given parent', async () => {
      const result = await service.findChildren(data[1]);

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Post);
      expect(result.children).toBeDefined();
      expect(result.children.length).toBeGreaterThan(0);
    });
    */
   /* End disabled tests */

    it('URI from post entity should create a properly-formatted URI', () => {
      const result = service.uriFromLocalPost(data[1]);

      expect(result).toBeDefined();
      expect(result.search(uuidFormat)).toBeTruthy();
      expect(result.startsWith('https')).toBeTruthy();
    });

    it('URI from UUID should create a properly-formatted URI', () => {
      const result = service.uriFromUuid(sampleUuid);

      expect(result).toBeDefined();
      expect(result.search(uuidFormat)).toBeTruthy();
      expect(result.startsWith('https')).toBeTruthy();
    });

    it('create new UUID should do that', () => {
      const result = service.createNewUuid('test');

      expect(result).toBeDefined();
      expect(result.search(uuidFormat)).toBeTruthy();
    });
  });
});
