import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService, EnvConfig } from './config.service';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeAll(async () => {
    const mockReadFileSync = jest.spyOn(fs, 'readFileSync');
    mockReadFileSync.mockImplementation(() => '');

    service = new ConfigService('config.json');

    mockReadFileSync.mockRestore();
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
