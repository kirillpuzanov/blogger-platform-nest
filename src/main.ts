import { NestFactory } from '@nestjs/core';
import { appSetup } from './setup/app.setup';
import { initAppModule } from './app/init-app-module';
import { CoreConfig } from './config/core.config';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const dynamicAppModule = await initAppModule();
  const app =
    await NestFactory.create<NestExpressApplication>(dynamicAppModule);

  const coreConfig = app.get<CoreConfig>(CoreConfig);

  appSetup(app, coreConfig.isSwaggerEnabled);

  await app.listen(coreConfig.port ?? 3001);
}

bootstrap();
