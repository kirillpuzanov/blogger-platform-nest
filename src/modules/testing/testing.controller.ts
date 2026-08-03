import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

const SQL_COLLECTIONS = ['users', 'sessions', 'blogs', 'posts'];

@Controller('testing')
export class TestingController {
  constructor(
    @InjectConnection() private readonly databaseConnection: Connection,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    const collections = await this.databaseConnection.listCollections();

    const promises = collections.map((collection) => {
      return this.databaseConnection.collection(collection.name).deleteMany({});
    });
    await Promise.all(promises);

    const sqlPromises = SQL_COLLECTIONS.map((collection) => {
      return this.dataSource.query<void>(
        `TRUNCATE TABLE ${collection} RESTART IDENTITY`,
      );
    });

    await Promise.all(sqlPromises);

    return {
      status: 'succeeded',
    };
  }
}
