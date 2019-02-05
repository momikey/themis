import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService, EnvConfig } from './config.service';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeAll(async () => {
    const mockReadFileSync = jest.spyOn(fs, 'readFileSync');
    mockReadFileSync.mockImplementation(() => `
      SERVER_ADDRESS=example.com
    `);

    service = new ConfigService('config.json');

    mockReadFileSync.mockRestore();
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a valid configuration value when set', () => {
    const address = service.serverAddress;

    expect(address).toMatch('example.com');
  });

  it('should return a reasonable value for unset config settings', () => {
    const port = service.serverPort;

    expect(port).toBeDefined();
    expect(port).toBeGreaterThanOrEqual(0);
    expect(port).toBeLessThan(65536);
  });
});
