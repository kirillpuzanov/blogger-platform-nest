import { NestFactory } from '@nestjs/core';
import { appSetup } from './setup/app.setup';
import { initAppModule } from './app/init-app-module';
import { CoreConfig } from './config/core.config';

async function bootstrap() {
  const dynamicAppModule = await initAppModule();
  const app = await NestFactory.create(dynamicAppModule);

  const coreConfig = app.get<CoreConfig>(CoreConfig);
  // app.enableCors({
  //   credentials: true,
  // });  // todo ??
  appSetup(app, coreConfig.isSwaggerEnabled);

  await app.listen(coreConfig.port ?? 3001);
}

bootstrap();
