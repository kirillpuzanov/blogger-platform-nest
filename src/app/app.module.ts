import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from '../modules/user-accounts/user-accounts.module';
import { settings } from '../setup/settings';
import { TestingModule } from '../modules/testing/testing.module';
import { BloggersPlatformModule } from '../modules/bloggers-platform/bloggers-platform.module';
import { APP_FILTER } from '@nestjs/core';
import { DomainHttpExceptionsFilter } from '../core/exceptions/filters/domain-exceptions.filter';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    CqrsModule.forRoot(),
    MongooseModule.forRoot(settings.MONGO_URL, {
      dbName: settings.DB_NAME,
    }),
    UserAccountsModule,
    TestingModule,
    BloggersPlatformModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    /** Регистрируем глобальные перехватчики ошибок, перед отправкой ответа клиету */
    {
      provide: APP_FILTER,
      useClass: DomainHttpExceptionsFilter,
    },
  ],
})
export class AppModule {}
