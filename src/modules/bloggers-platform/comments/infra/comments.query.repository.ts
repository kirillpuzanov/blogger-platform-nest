import { ObjectId } from 'mongodb';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, type CommentModelType } from '../domain/comment.entity';
import { CommentViewDto } from '../api/view-dto/comment.view-dto';
import { GetCommentsQueryInputDto } from '../api/input-dto/get-comments-query.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base-paginated.view-dto';
import { PostsQueryRepository } from '../../posts/infra/posts.query.repository';
import { LikeQueryRepository } from '../../likes/infra/like.query.repository';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain.exception';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.modelName)
    private CommentModel: CommentModelType,
    private postsQueryRepository: PostsQueryRepository,
    private likeQueryRepository: LikeQueryRepository,
  ) {}

  async getById(
    id: string,
    userId: string | undefined,
  ): Promise<CommentViewDto> {
    const comment = await this.CommentModel.findOne({ _id: new ObjectId(id) });

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'comment not found',
      });
    }

    const userLikes = await this.likeQueryRepository.getUserLikes(userId, [
      comment._id.toString(),
    ]);

    return CommentViewDto.mapToView(comment, userLikes);
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

    const commentsByPost = await this.CommentModel.find({ postId })
      .sort({ [sortBy]: sortDirection })
      .skip(query.calculateSkip())
      .limit(pageSize)
      .lean();

    const totalCount = await this.CommentModel.countDocuments({ postId });

    const commentsIds = commentsByPost.map((el) => el._id.toString());
    const myLikes = await this.likeQueryRepository.getUserLikes(
      userId,
      commentsIds,
    );

    const commentsByPostView = commentsByPost.map((el) =>
      CommentViewDto.mapToView(el, myLikes),
    );

    return PaginatedViewDto.mapToView({
      page: pageNumber,
      totalCount,
      items: commentsByPostView,
      size: pageSize,
    });
  }
}
