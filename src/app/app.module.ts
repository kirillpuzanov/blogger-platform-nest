import { configDynamicModule } from '../config/config-dynamic.module';

import { DynamicModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserAccountsModule } from '../modules/user-accounts/user-accounts.module';
import { TestingModule } from '../modules/testing/testing.module';
import { BloggersPlatformModule } from '../modules/bloggers-platform/bloggers-platform.module';
import { APP_FILTER } from '@nestjs/core';
import { DomainHttpExceptionsFilter } from '../core/exceptions/filters/domain-exceptions.filter';
import { AllHttpExceptionsFilter } from '../core/exceptions/filters/all-exceptions.filter';
import { CoreConfig } from '../config/core.config';
import { NotificationsModule } from '../modules/notifications/notifications.module';
import { CoreModule } from '../core/core.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerExceptionsFilter } from '../core/exceptions/filters/throttler-exceptions.filter';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    // MongooseModule.forRootAsync({
    //   inject: [CoreConfig],
    //   useFactory: (coreConfig: CoreConfig) => ({
    //     uri: coreConfig.mongoUrl,
    //     dbName: coreConfig.dbName,
    //   }),
    // }),

    TypeOrmModule.forRootAsync({
      inject: [CoreConfig],
      useFactory: (coreConfig: CoreConfig) => ({
        type: 'postgres',
        host: 'localhost',
        port: coreConfig.sqlPort,
        username: coreConfig.sqlUserName,
        database: coreConfig.sqlDbName,
        autoLoadEntities: true,
        synchronize: true,
        logging: true,
      }),
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 10_000, // Время жизни записи - 10 сек
        limit: 5, // Максимальное количество запросов за период
      },
    ]),
    UserAccountsModule,
    BloggersPlatformModule,

    NotificationsModule,
    CoreModule,
    configDynamicModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    /** Регистрируем глобальные перехватчики ошибок, перед отправкой ответа клиету, порядок важен? сначала Domain */
    {
      provide: APP_FILTER,
      useClass: AllHttpExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ThrottlerExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DomainHttpExceptionsFilter,
    },
  ],
})
export class AppModule {
  static forRoot(coreConfig: CoreConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [...(coreConfig.isIncludeTestingModule ? [TestingModule] : [])],
    };
  }
}
