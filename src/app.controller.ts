import { Get, Controller, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  root() {
    return this.appService.root();
  }

  // Returns some basic site info. (HT: Fedilab)
  // We'll add to this later.
  @Get('/api/info')
  getSiteInfo() {
    return this.appService.getSiteInfo();
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
