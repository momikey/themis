import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { json } from 'body-parser';
import { AP } from './activitypub/definitions/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // By default, body-parser (which Nest uses via Express),
  // only reads bodies of POST requests with Content-Type
  // 'application/json'. AP requires others, so we have to
  // tell it to handle those, too.
  app.use(json({ type: (req) => {
    return req.headers['content-type'].startsWith('application/json') ||
      req.headers['content-type'] === AP.ContentType ||
      req.headers['content-type'] === AP.AltContentType
  }}));

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '.', 'frontend'));
  app.setViewEngine('ejs');

  await app.listen(3000);
}
bootstrap();
