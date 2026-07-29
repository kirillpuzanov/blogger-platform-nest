import { Injectable } from '@nestjs/common';
import {
  GetPostsQueryInputDto,
  sortByPostsQueryAdapter,
} from '../api/input-dto/get-posts-query.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base-paginated.view-dto';
import { PostViewDto } from '../api/view-dto/post.view-dto';
import { BlogsQueryRepository } from '../../blogs/infra/blogs.query.repository';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain.exception';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostSqlDto } from '../domain/dto/post.sql-dto';

@Injectable()
export class PostsQueryRepository {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    //todo private likeQueryRepository: LikeQueryRepository,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async getAll(
    query: GetPostsQueryInputDto,
    userId: string | undefined,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const { pageNumber, pageSize, sortBy, sortDirection } = query;

    const offset = query.calculateSkip();

    const sortByExpression =
      sortByPostsQueryAdapter[sortBy] === 'created_at'
        ? sortByPostsQueryAdapter[sortBy]
        : `${sortByPostsQueryAdapter[sortBy]} COLLATE "C"`;

    const posts = await this.dataSource.query<PostSqlDto[]>(
      `
      SELECT * FROM posts
      ORDER BY ${sortByExpression} ${sortDirection}
      LIMIT $1 OFFSET $2
    `,
      [pageSize, offset],
    );

    const countResult = await this.dataSource.query<[{ total: string }]>(
      `SELECT COUNT(*) as total FROM posts`,
    );

    const totalCount = Number(countResult[0]?.total || 0);
    const postsView = posts.map((el) => PostViewDto.mapToViewSql(el, {}, []));

    return PaginatedViewDto.mapToView({
      page: pageNumber,
      totalCount,
      items: postsView,
      size: pageSize,
    });
  }

  async getByIdOrFail(
    id: string,
    userId: string | undefined,
  ): Promise<PostViewDto> {
    const posts = await this.dataSource.query<PostSqlDto[]>(
      `SELECT * FROM posts WHERE "id"=$1`,
      [id],
    );

    if (!posts[0]) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'post not found',
      });
    }

    return PostViewDto.mapToViewSql(posts[0], {}, []);
  }

  async getPostsByBlog(
    blogId: string,
    query: GetPostsQueryInputDto,
    userId: string | undefined,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const { pageNumber, pageSize, sortBy, sortDirection } = query;

    const blog = await this.blogsQueryRepository.getByIdOrFail(blogId);

    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'blog does not exists',
      });
    }

    const offset = query.calculateSkip();

    const sortByExpression =
      sortByPostsQueryAdapter[sortBy] === 'created_at'
        ? sortByPostsQueryAdapter[sortBy]
        : `${sortByPostsQueryAdapter[sortBy]} COLLATE "C"`;

    const postsByBlog = await this.dataSource.query<PostSqlDto[]>(
      `
      SELECT * FROM posts
      WHERE "blog_id"=$1
      ORDER BY ${sortByExpression} ${sortDirection}
      LIMIT $2 OFFSET $3
    `,
      [blogId, pageSize, offset],
    );

    const countResult = await this.dataSource.query<[{ total: string }]>(
      `SELECT COUNT(*) as total FROM posts WHERE "blog_id"=$1`,
      [blogId],
    );

    const totalCount = Number(countResult[0]?.total || 0);
    const postsByBlogView = postsByBlog.map((el) =>
      PostViewDto.mapToViewSql(el, {}, []),
    );

    return PaginatedViewDto.mapToView({
      page: pageNumber,
      totalCount,
      items: postsByBlogView,
      size: pageSize,
    });
  }
}

// Mongoose
// @Injectable()
// export class PostsQueryRepository {
//   constructor(
//     @InjectModel(Post.modelName) private PostModel: PostModelType,
//     private blogsQueryRepository: BlogsQueryRepository,
//     private likeQueryRepository: LikeQueryRepository,
//   ) {}
//
//   async getAll(
//     query: GetPostsQueryInputDto,
//     userId: string | undefined,
//   ): Promise<PaginatedViewDto<PostViewDto[]>> {
//     const { pageNumber, pageSize, sortBy, sortDirection } = query;
//
//     const posts = await this.PostModel.find()
//       .sort({ [sortBy]: sortDirection })
//       .skip(query.calculateSkip())
//       .limit(pageSize)
//       .lean();
//
//     const totalCount = await this.PostModel.countDocuments();
//
//     const postsIds = posts.map((el) => el._id.toString());
//     const myLikes = await this.likeQueryRepository.getUserLikes(
//       userId,
//       postsIds,
//     );
//
//     const postsView = posts.map((el) => PostViewDto.mapToView(el, myLikes));
//
//     return PaginatedViewDto.mapToView({
//       page: pageNumber,
//       totalCount,
//       items: postsView,
//       size: pageSize,
//     });
//   }
//
//   async getByIdOrFail(
//     id: string,
//     userId: string | undefined,
//   ): Promise<PostViewDto> {
//     const post = await this.PostModel.findOne({ _id: new ObjectId(id) });
//
//     if (!post) {
//       throw new DomainException({
//         code: DomainExceptionCode.NotFound,
//         message: 'post not found',
//       });
//     }
//
//     const userLikes = await this.likeQueryRepository.getUserLikes(userId, [
//       post._id.toString(),
//     ]);
//
//     return PostViewDto.mapToView(post, userLikes);
//   }
//
//   async getPostsByBlog(
//     blogId: string,
//     query: GetPostsQueryInputDto,
//     userId: string | undefined,
//   ): Promise<PaginatedViewDto<PostViewDto[]>> {
//     const { pageNumber, pageSize, sortBy, sortDirection } = query;
//
//     const blog = await this.blogsQueryRepository.getByIdOrFail(blogId);
//
//     if (!blog) {
//       throw new DomainException({
//         code: DomainExceptionCode.NotFound,
//         message: 'blog does not exists',
//       });
//     }
//
//     const postsByBlog = await this.PostModel.find({ blogId })
//       .sort({ [sortBy]: sortDirection })
//       .skip(query.calculateSkip())
//       .limit(pageSize)
//       .lean();
//     const totalCount = await this.PostModel.countDocuments({ blogId });
//
//     const postsByBlogIds = postsByBlog.map((el) => el._id.toString());
//     const myLikes = await this.likeQueryRepository.getUserLikes(
//       userId,
//       postsByBlogIds,
//     );
//
//     const postsByBlogView = postsByBlog.map((el) =>
//       PostViewDto.mapToView(el, myLikes),
//     );
//
//     return PaginatedViewDto.mapToView({
//       page: pageNumber,
//       totalCount,
//       items: postsByBlogView,
//       size: pageSize,
//     });
//   }
// }
