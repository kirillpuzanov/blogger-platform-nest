import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/blog.entity';
import { BlogsController } from './blogs/blogs.controller';
import { BlogsService } from './blogs/application/blogs.service';
import { BlogsRepository } from './blogs/infra/blogs.repository';
import { BlogsQueryRepository } from './blogs/infra/blogs.query.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Blog.modelName,
        schema: BlogSchema,
        collection: Blog.collectionName,
      },
    ]),
  ],
  controllers: [BlogsController],
  providers: [BlogsService, BlogsRepository, BlogsQueryRepository],
})
export class BloggersPlatformModule {}
