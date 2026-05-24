import { INestApplication } from '@nestjs/common';
import { settings } from './settings';

export function globalPrefixSetup(app: INestApplication) {
  app.setGlobalPrefix(settings.APP_GLOBAL_PREFIX);
}
