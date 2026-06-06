import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/blog.entity';
import { BlogsController } from './blogs/blogs.controller';
import { BlogsRepository } from './blogs/infra/blogs.repository';
import { BlogsQueryRepository } from './blogs/infra/blogs.query.repository';
import { PostsController } from './posts/posts.controller';
import { PostsRepository } from './posts/infra/posts.repository';
import { PostsQueryRepository } from './posts/infra/posts.query.repository';
import { Post, PostSchema } from './posts/domain/post.entity';
import { CreateBlogUseCase } from './blogs/usecases/create-blog.case';
import { UpdateBlogUseCase } from './blogs/usecases/update-blog.case';
import { DeleteBlogUseCase } from './blogs/usecases/delete-blog.case';
import { CreatePostUseCase } from './posts/useases/create-post.case';
import { UpdatePostUseCase } from './posts/useases/update-post.case';
import { DeletePostUseCase } from './posts/useases/delete-post.case';
import { UpdatePostLikeCommand } from './posts/useases/update-post-like.case';

const cases = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,

  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  UpdatePostLikeCommand,
];

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
    ...cases,

    BlogsRepository,
    BlogsQueryRepository,

    PostsRepository,
    PostsQueryRepository,
  ],
})
export class BloggersPlatformModule {}
