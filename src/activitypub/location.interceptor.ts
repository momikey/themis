import { ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

/**
 * ActivityPub requires us to set the Location header of a
 * newly created object to its ID (usually a URI). To do this
 * in NestJS, we have to use an interceptor to add the header,
 * since we don't know the ID at the time the original request.
 *
 * @export
 * @class LocationInterceptor
 */
@Injectable()
export class LocationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, call$: Observable<any>): Observable<any> {
    return call$.pipe(
      map((data) => {
        const res = context.switchToHttp().getResponse();
        res.header('Location', data.id);
        return data;
      })
    );
  }
}
