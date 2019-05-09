import { CanActivate, ExecutionContext, Injectable, NotImplementedException, MethodNotAllowedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ServerService } from '../server/server.service';
import { ConfigService } from '../config/config.service';

/**
 * Federation between servers (whether Themis or other fediverse
 * implementations) can be disabled in the server configuation.
 * Some API endpoints are only valid if using federation, so this
 * guard returns the appropriate status code in the event that a
 * server with federation disabled receives a request anyway.
 *
 * @export
 * @class FederationGuard
 */
@Injectable()
export class FederationGuard implements CanActivate {
  constructor(
    private readonly serverService: ServerService,
    private readonly configService: ConfigService
  )
  {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const activity = request.body;

    if (this.configService.isFederating || activity.id.startsWith(this.serverService.localHostname())) {
      return true;
    } else {
      throw new MethodNotAllowedException;
    }
  }
}
