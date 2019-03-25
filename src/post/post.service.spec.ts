import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '../config/config.service';
import { UserService } from '../user/user.service';
import { GroupService } from '../group/group.service';
import { Repository } from 'typeorm/repository/Repository';
import * as uuidv5 from 'uuid/v5';
import * as URI from 'uri-js';
import { ServerService } from '../server/server.service';
import { Post } from '../entities/post.entity';
import { Server } from '../entities/server.entity';
import { CreatePostDto } from '../dtos/create-post.dto';
import { CreateTopLevelPostDto } from '../dtos/create-top-level-post.dto';
import { CreateReplyDto } from '../dtos/create-reply.dto';
import { User } from '../entities/user.entity';
import { Group } from '../entities/group.entity';
import { CreateGlobalPostDto } from '../dtos/create-global-post.dto';

jest.mock('../user/user.service');
jest.mock('../group/group.service');
jest.mock('../server/server.service');

jest.mock('typeorm/repository/Repository'); 

jest.mock('../config/config.service');
const ConfigServiceMock = <jest.Mock<ConfigService>>ConfigService as any;
ConfigServiceMock.mockImplementation(() => {
  return {
    serverAddress: 'example.com',
    serverPort: 3000
  }
});

describe('PostService', () => {
  let service: PostService;
  let repository: jest.Mocked<Repository<Post>>;
  let userService: jest.Mocked<UserService>;
  let groupService: jest.Mocked<GroupService>;
  let configService: jest.Mocked<ConfigService>;
  let serverService: jest.Mocked<ServerService>;
  
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        UserService,
        GroupService,
        { provide: getRepositoryToken(Post), useClass: Repository },
        { provide: ConfigService, useClass: ConfigServiceMock },
        ServerService
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    repository = module.get<Repository<Post>>(getRepositoryToken(Post)) as jest.Mocked<Repository<Post>>;
    userService = module.get<UserService>(UserService) as jest.Mocked<UserService>;
    groupService = module.get<GroupService>(GroupService) as jest.Mocked<GroupService>;
    configService = module.get<ConfigService>(ConfigService) as jest.Mocked<ConfigService>;
    serverService = module.get<ServerService>(ServerService) as jest.Mocked<ServerService>;
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

    const sampleServer = Object.assign(new Server, {
      host: 'example.com',
      scheme: 'http',
      port: 80
    });
    const sampleServerUri = URI.normalize(URI.serialize(sampleServer));

    const samplePost: CreatePostDto = {
      sender: 'user',
      server: sampleServerUri,
      subject: 'Subject',
      parent: '',
      primaryGroup: 'group',
      ccGroups: [],
      content: 'This is a test',
      source: ''
    };
    const sampleTopLevel: CreateTopLevelPostDto = {
      sender: 'user',
      server: sampleServerUri,
      subject: 'Subject',
      primaryGroup: 'group',
      ccGroups: [],
      content: 'This is a test',
      source: ''
    };
    const sampleReply: CreateReplyDto = {
      sender: 'user',
      server: sampleServerUri,
      subject: 'Subject',
      group: 1,
      content: 'This is a test',
      source: ''
    };


    const data: Post[] = [
      Object.assign(new Post, {id: 1, uuid: sampleUuid, server: sampleServer, sender: new User, uri: '', parentUri: '',
        groups: [], subject: 'Subject', content: 'Content', source: '', timestamp: '',
        deleted: false, children: [], parent: undefined, activities: [] }),
      Object.assign(new Post, {id: 2, uuid: '00000000-1234-5678-987654321cafe', server: sampleServer, sender: new User, 
        uri: '', parentUri: '', groups: [], subject: 'Subject', content: 'Content', 
        source: '', timestamp: '', deleted: false, children: [], parent: undefined, activities: [] })
    ];

    beforeAll(() => {
      userService.findByName.mockResolvedValue(new User);
      groupService.findByIds.mockResolvedValue([new Group]);

      repository.create.mockImplementation((entity) => Object.assign(new Post, entity));
      repository.save.mockImplementation(async (entity) => entity as Post);
      repository.findOne.mockImplementation(async (o: {uuid: string}) => 
        Object.assign(new Post, data.find((_) => _.uuid === o.uuid))
      );
      repository.remove.mockImplementation(async (entity) => Object.assign(new Post, entity));
      repository.find.mockImplementation(async () => (
        data.map((e) => Object.assign(new Post, e))
      ));

      serverService.local.mockResolvedValue(Object.assign(new Server, {
        host: 'example.com',
        port: 80,
        scheme: 'http'
      }));
    });

    it('create should create a post entity', async () => {
      const result = await service.create(samplePost);

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Post);
      expect(result.server.host).toBe(sampleServer.host);
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

    it('URI from post entity should create a properly-formatted URI', async () => {
      const result = await service.uriFromLocalPost(data[1]);

      expect(result).toBeDefined();
      expect(result.search(uuidFormat)).toBeTruthy();
      expect(result.startsWith('http')).toBeTruthy();
    });

    it('URI from UUID should create a properly-formatted URI', () => {
      const result = service.uriFromUuid(sampleUuid);

      expect(result).toBeDefined();
      expect(result.search(uuidFormat)).toBeTruthy();
      expect(result.startsWith('http')).toBeTruthy();
    });

    it('create new UUID should do that', () => {
      const result = service.createNewUuid('test');

      expect(result).toBeDefined();
      expect(result.search(uuidFormat)).toBeTruthy();
    });

    it('finding/creating a new user should perform the appropriate action', async () => {
      userService.create.mockResolvedValue(Object.assign(new User, {
        name: 'user',
        server: 'example.com',
        displayName: 'A user',
      }));

      userService.findGlobalByName.mockResolvedValueOnce(Object.assign(new User, {
        name: 'test',
        server: 'example.invalid',
        displayName: 'Test user'
      }));
      const goodResult = await service.findOrCreateUser({name: 'test', server: 'example.invalid'});
      
      expect(goodResult).toBeDefined();
      expect(goodResult.name).toBe('test');

      userService.findGlobalByName.mockRejectedValueOnce(undefined);
      const badResult = await service.findOrCreateUser({name: 'user', server: 'example.com'});

      expect(badResult).toBeDefined();
      expect(badResult.name).toBe('user');
    });

    it('creating from an activity should produce a new Post entity', async () => {
      const newPost: CreateGlobalPostDto = {
        sender: {
          name: 'user',
          server: 'example.com'
        },
        subject: 'Test post',
        groups: [{
          name: 'group',
          server: 'example.com'
        }],
        content: 'This is a test',
        recipients: [],
      };

      const result = await service.createFromActivity(newPost);

      expect(result).toBeDefined();
    });
  });
});
