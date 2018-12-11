import { Test, TestingModule } from '@nestjs/testing';
import { InboxOutboxController } from './inbox-outbox.controller';

describe('InboxOutbox Controller', () => {
  let module: TestingModule;
  
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [InboxOutboxController],
    }).compile();
  });
  it('should be defined', () => {
    const controller: InboxOutboxController = module.get<InboxOutboxController>(InboxOutboxController);
    expect(controller).toBeDefined();
  });
});
