import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/blog.entity';
import { BlogsController } from './blogs/blogs.controller';
import { BlogsService } from './blogs/application/blogs.service';
import { BlogsRepository } from './blogs/infra/blogs.repository';
import { BlogsQueryRepository } from './blogs/infra/blogs.query.repository';
import { PostsController } from './posts/posts.controller';
import { PostsRepository } from './posts/infra/posts.repository';
import { PostsQueryRepository } from './posts/infra/posts.query.repository';
import { PostsService } from './posts/application/posts.service';
import { Post, PostSchema } from './posts/domain/post.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Blog.modelName,
        schema: BlogSchema,
        collection: Blog.collectionName,
      },
      {
        name: Post.modelName,
        schema: PostSchema,
        collection: Post.collectionName,
      },
    ]),
  ],
  controllers: [BlogsController, PostsController],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,

    PostsRepository,
    PostsQueryRepository,
    PostsService,
  ],
})
export class BloggersPlatformModule {}
