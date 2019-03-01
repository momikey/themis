import { ContentTypeGuard } from './content-type.guard';

describe('ContentTypeGuard', () => {
  it('should be defined', () => {
    expect(new ContentTypeGuard()).toBeTruthy();
  });
});
