import { INestApplication } from '@nestjs/common';
import { swaggerSetup } from './swagger.setup';
import { pipesSetup } from './pipes.setup';
import cookieParser from 'cookie-parser';
import useragent from 'express-useragent';

export function appSetup(app: INestApplication, isSwaggerEnabled: boolean) {
  app.use(useragent.express());
  app.use(cookieParser());
  pipesSetup(app);
  swaggerSetup(app, isSwaggerEnabled);
}
