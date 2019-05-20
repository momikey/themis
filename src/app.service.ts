import { Injectable } from '@nestjs/common';

/**
 * This service handles any app-level functionality,
 * though there's not much of that yet.
 *
 * @export
 * @class AppService
 */
@Injectable()
export class AppService {
  root() {
    return {};
  }
}
