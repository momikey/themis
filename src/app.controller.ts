import { Get, Controller, Render } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * This is the "base" controller for Themis. In practice,
 * almost all functionality is delegated to other controllers.
 *
 * @export
 * @class AppController
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  root() {
    return this.appService.root();
  }

  // We'll take this out later
  @Get('/admin')
  @Render('admin')
  getAdminPanel() {
    return {};
  }

  // TODO: Do more with this, like authentication and stuff
  @Get('/web')
  @Render('web')
  getWebInterface() {
    return {};
  }
}
