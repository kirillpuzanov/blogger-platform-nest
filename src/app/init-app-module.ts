import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DynamicModule } from '@nestjs/common';
import { CoreConfig } from '../config/core.config';

export async function initAppModule(): Promise<DynamicModule> {
  // нужно динамический AppModule, не можем сразу создавать приложение, создаём сначала контекст
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const coreConfig = appContext.get<CoreConfig>(CoreConfig);
  await appContext.close();

  return AppModule.forRoot(coreConfig);
}
