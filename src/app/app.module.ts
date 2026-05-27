import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../modules/users/users.module';
import { settings } from '../setup/settings';
import { TestingModule } from '../modules/testing/testing.module';
import { BloggersPlatformModule } from '../modules/bloggers-platform/bloggers-platform.module';

@Module({
  imports: [
    MongooseModule.forRoot(settings.MONGO_URL, {
      dbName: settings.DB_NAME,
    }),
    UsersModule,
    TestingModule,
    BloggersPlatformModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
