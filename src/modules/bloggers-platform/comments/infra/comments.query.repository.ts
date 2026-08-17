import { Injectable } from '@nestjs/common';
import { CommentViewDto } from '../api/view-dto/comment.view-dto';
import {
  GetCommentsQueryInputDto,
  sortByCommentsQueryAdapter,
} from '../api/input-dto/get-comments-query.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base-paginated.view-dto';
import { PostsQueryRepository } from '../../posts/infra/posts.query.repository';
import { LikeQueryRepository } from '../../likes/infra/like.query.repository';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain.exception';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentSqlDto } from '../domain/comment.sql-dto';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private postsQueryRepository: PostsQueryRepository,
    private likeQueryRepository: LikeQueryRepository,
  ) {}

  async getById(
    id: string,
    userId: string | undefined,
  ): Promise<CommentViewDto> {
    const comments = await this.dataSource.query<CommentSqlDto[]>(
      `SELECT * FROM comments WHERE id=$1`,
      [id],
    );

    const comment = comments[0];

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'comment not found',
      });
    }

    const userLikes = await this.likeQueryRepository.getUserLikes(userId, [
      comment.id,
    ]);

    return CommentViewDto.mapToViewSql(comment, userLikes);
  }

  async getCommentsByPost(
    postId: string,
    query: GetCommentsQueryInputDto,
    userId: string | undefined,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const { pageNumber, pageSize, sortBy, sortDirection } = query;

    const post = await this.postsQueryRepository.getByIdOrFail(postId, userId);

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'post not found',
      });
    }

    const offset = query.calculateSkip();

    const sortByExpression =
      sortByCommentsQueryAdapter[sortBy] === 'created_at'
        ? sortByCommentsQueryAdapter[sortBy]
        : `${sortByCommentsQueryAdapter[sortBy]} COLLATE "C"`;

    const commentsByPost = await this.dataSource.query<CommentSqlDto[]>(
      `
      SELECT * FROM comments
      WHERE post_id=$1
      ORDER BY ${sortByExpression} ${sortDirection}
      LIMIT $2 OFFSET $3
    `,
      [postId, pageSize, offset],
    );

    const countResult = await this.dataSource.query<[{ total: string }]>(
      `SELECT COUNT(*) as total FROM comments WHERE post_id=$1`,
      [postId],
    );

    const totalCount = Number(countResult[0]?.total || 0);
    const commentsIds = commentsByPost.map((el) => el.id);

    const userLikes = await this.likeQueryRepository.getUserLikes(
      userId,
      commentsIds,
    );

    const commentsByPostView = commentsByPost.map((el) =>
      CommentViewDto.mapToViewSql(el, userLikes),
    );

    return PaginatedViewDto.mapToView({
      page: pageNumber,
      totalCount,
      items: commentsByPostView,
      size: pageSize,
    });
  }
}
