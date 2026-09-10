import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  database: 'blog_post',
  // synchronize: true,
  logging: true,
  migrations: ['migrations/*.ts'],
  // entities: ['src/**/*.entity.ts'],
  entities: ['src/**/*.entity.ts'],
});
