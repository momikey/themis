import { Injectable } from '@nestjs/common';
import * as pjson from 'pjson';

@Injectable()
export class AppService {
  root() {
    return {};
  }

  getSiteInfo() {
      return {
      'software': 'Themis',
      'version': pjson.version
    }
  }
}
