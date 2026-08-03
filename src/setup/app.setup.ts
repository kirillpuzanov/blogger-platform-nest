import { swaggerSetup } from './swagger.setup';
import { pipesSetup } from './pipes.setup';
import cookieParser from 'cookie-parser';
import useragent from 'express-useragent';
import { NestExpressApplication } from '@nestjs/platform-express';

export function appSetup(
  app: NestExpressApplication,
  isSwaggerEnabled: boolean,
) {
  app.set('trust proxy', true);
  app.use(useragent.express());
  app.use(cookieParser());
  pipesSetup(app);
  swaggerSetup(app, isSwaggerEnabled);
}
