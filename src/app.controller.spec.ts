import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;
  let appController: AppController;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  // We really don't have much to do here yet,
  // because the front end is basically an SPA.
  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  it('site info endpoint should work', () => {
    const result = appController.getSiteInfo();

    expect(result).toBeDefined();
    expect(result.software).toBe('Themis');
    expect(result.version).toMatch(/\d+.\d+.\d+/);
  });
});
