import { Module } from '@nestjs/common';
import { BlogsController } from './blogs/blogs.controller';
import { BlogsRepository } from './blogs/infra/blogs.repository';
import { BlogsQueryRepository } from './blogs/infra/blogs.query.repository';
import { PostsController } from './posts/posts.controller';
import { PostsRepository } from './posts/infra/posts.repository';
import { PostsQueryRepository } from './posts/infra/posts.query.repository';
import { CreateBlogUseCase } from './blogs/usecases/create-blog.case';
import { UpdateBlogUseCase } from './blogs/usecases/update-blog.case';
import { DeleteBlogUseCase } from './blogs/usecases/delete-blog.case';
import { CreatePostUseCase } from './posts/useases/create-post.case';
import { UpdatePostUseCase } from './posts/useases/update-post.case';
import { DeletePostUseCase } from './posts/useases/delete-post.case';
import { UpdatePostLikeUseCase } from './posts/useases/update-post-like.case';
import { CommentsQueryRepository } from './comments/infra/comments.query.repository';
import { CommentsController } from './comments/comments.controller';
import { UpdateCommentUseCase } from './comments/usecases/update-comment.case';
import { UpdateCommentLikeUseCase } from './comments/usecases/update-comment-like.case';
import { DeleteCommentUseCase } from './comments/usecases/delete-comment.case';
import { LikeRepository } from './likes/infra/like.repository';
import { LikeQueryRepository } from './likes/infra/like.query.repository';
import { CommentsRepository } from './comments/infra/comments.repository';
import { LikeService } from './likes/like.service';
import { CreateCommentUseCase } from './comments/usecases/create-comment.case';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { BlogsSaController } from './blogs/blogs-sa.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogTypeOrm } from './blogs/domain/blog.entity';

const cases = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,

  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  UpdatePostLikeUseCase,

  UpdateCommentUseCase,
  DeleteCommentUseCase,
  UpdateCommentLikeUseCase,
  CreateCommentUseCase,
];

@Module({
  imports: [
    // MongooseModule.forFeature([
    //   {
    //     name: Blog.modelName,
    //     schema: BlogSchema,
    //     collection: Blog.collectionName,
    //   },
    //   {
    //     name: Post.modelName,
    //     schema: PostSchema,
    //     collection: Post.collectionName,
    //   },
    //   {
    //     name: Comment.modelName,
    //     schema: CommentSchema,
    //     collection: Comment.collectionName,
    //   },
    //   {
    //     name: Like.modelName,
    //     schema: LikeSchema,
    //     collection: Like.collectionName,
    //   },
    // ]),
    TypeOrmModule.forFeature([BlogTypeOrm]),

    UserAccountsModule,
  ],
  controllers: [
    BlogsController,
    PostsController,
    CommentsController,
    BlogsSaController,
  ],
  providers: [
    ...cases,

    BlogsRepository,
    BlogsQueryRepository,

    PostsRepository,
    PostsQueryRepository,

    CommentsRepository,
    CommentsQueryRepository,

    LikeService,
    LikeRepository,
    LikeQueryRepository,
  ],
})
export class BloggersPlatformModule {}
