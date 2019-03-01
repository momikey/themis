import { CanActivate, ExecutionContext, Injectable, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AP } from './definitions/constants';

@Injectable()
export class ContentTypeGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const header = request.get('Content-Type');

    if (header == AP.ContentType || header == AP.AltContentType) {
      return true;
    } else {
      throw new BadRequestException('Invalid content type');
    }
  }
}
