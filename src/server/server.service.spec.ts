import { Test, TestingModule } from '@nestjs/testing';
import { ServerService } from './server.service';
import { ConfigService } from '../config/config.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server } from './server.entity';

jest.mock('typeorm/repository/Repository'); 
jest.mock('../config/config.service');

describe('ServerService', () => {
  let service: ServerService;
  let repository = new Repository<Server>();
  let configService: jest.Mocked<ConfigService>;

  jest.spyOn(repository, 'create').mockReturnValue({} as Server);
  jest.spyOn(repository, 'findOneOrFail').mockResolvedValue({} as Server);
  
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServerService,
        ConfigService,
        { provide: getRepositoryToken(Server), useValue: repository }
      ],
    }).compile();

    service = module.get<ServerService>(ServerService);
    configService = module.get<ConfigService>(ConfigService) as jest.Mocked<ConfigService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Method testing', () => {
    beforeAll(() => {
      Object.defineProperty(configService, 'serverPort', { get: jest.fn().mockReturnValue(80) });
    });

    it('parsing should return a valid host', () => {
      const hostOnly = service.parseHostname('example.com');
      const hostAndScheme = service.parseHostname('https://example.local');
      const hostSchemeAndPort = service.parseHostname('https://local.invalid:8080');
      const localhost = service.parseHostname('localhost:3000');
      
      expect(hostOnly).toBeDefined();
      expect(hostOnly.host).toBe('example.com');
      expect(hostOnly.port).toBe(80);
      expect(hostOnly.scheme).toBe('http');

      expect(hostAndScheme).toBeDefined();
      expect(hostAndScheme.host).toBe('example.local');
      expect(hostAndScheme.port).toBe(80);
      expect(hostAndScheme.scheme).toBe('https');

      expect(hostSchemeAndPort).toBeDefined();
      expect(hostSchemeAndPort.host).toBe('local.invalid');
      expect(hostSchemeAndPort.port).toBe(8080);
      expect(hostSchemeAndPort.scheme).toBe('https');

      expect(localhost).toBeDefined();
      expect(localhost.host).toBe('localhost');
      expect(localhost.port).toBe(3000);
      expect(localhost.scheme).toBe('http');
    });
  });
});
