import { CanActivate, ExecutionContext, Injectable, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AP } from './definitions/constants';

/**
 * The ActivityPub spec requires interactions to use a Content-Type of
 * 'application/ld+json; profile="https://www.w3.org/ns/activitystreams"'
 * (or the alternative ('application/activity+json') when communicating
 * with servers. Eventually, we need to use this guard on most API
 * endpoints.
 * 
 * Making NestJS understand this was difficult, as Express (the underlying
 * server) normally ignores it. See the '../main.ts' file for how we fixed
 * that problem.
 *
 * @export
 * @class ContentTypeGuard
 */
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
