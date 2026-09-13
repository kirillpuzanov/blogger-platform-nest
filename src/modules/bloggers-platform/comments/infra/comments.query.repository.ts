import { Injectable } from '@nestjs/common';
import { CommentViewDto } from '../api/view-dto/comment.view-dto';
import {
  GetCommentsQueryInputDto,
  sortByCommentsQueryAdapter,
} from '../api/input-dto/get-comments-query.input-dto';
import {
  PaginatedViewDto,
  sortDirectionAdapter,
} from '../../../../core/dto/base-paginated.view-dto';
import { PostsQueryRepository } from '../../posts/infra/posts.query.repository';
import { LikeQueryRepository } from '../../likes/infra/like.query.repository';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain.exception';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentTypeOrm } from '../domain/comment.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectRepository(CommentTypeOrm)
    private commentsRepo: Repository<CommentTypeOrm>,
    private postsQueryRepository: PostsQueryRepository,
    private likeQueryRepository: LikeQueryRepository,
  ) {}

  async getById(
    id: string,
    userId: string | undefined,
  ): Promise<CommentViewDto> {
    const comment = await this.commentsRepo.findOneBy({ id: id });

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

    const qb = this.commentsRepo.createQueryBuilder('comment');

    const sortByExpression =
      sortByCommentsQueryAdapter[sortBy] === 'created_at'
        ? sortByCommentsQueryAdapter[sortBy]
        : `${sortByCommentsQueryAdapter[sortBy]} COLLATE "C"`;

    qb.where('comment.post_id = :postId', { postId });
    qb.orderBy(sortByExpression, sortDirectionAdapter[sortDirection]);

    qb.take(pageSize).skip(query.calculateSkip());

    const [commentsByPost, totalCount] = await qb.getManyAndCount();

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
