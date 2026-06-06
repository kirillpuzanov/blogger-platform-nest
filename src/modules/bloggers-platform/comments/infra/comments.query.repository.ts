import { ObjectId } from 'mongodb';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, type CommentModelType } from '../domain/comment.entity';
import { CommentViewDto } from '../api/view-dto/comment.view-dto';
import { GetCommentsQueryInputDto } from '../api/input-dto/get-comments-query.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base-paginated.view-dto';
import { PostsQueryRepository } from '../../posts/infra/posts.query.repository';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.modelName)
    private CommentModel: CommentModelType,
    private postsQueryRepository: PostsQueryRepository,
    // private likeQueryRepository: LikeQueryRepository,
  ) {}

  async getById(
    id: string,
    // userId: string | undefined, // todo
  ): Promise<CommentViewDto> {
    const comment = await this.CommentModel.findOne({ _id: new ObjectId(id) });

    if (!comment) {
      throw new NotFoundException('comment does not exists');
    }
    // todo
    // const userLikes = await this.likeQueryRepository.getUserLikes(userId, [
    //   comment._id.toString(),
    // ]);

    return CommentViewDto.mapToView(comment, {});
  }

  async getCommentsByPost(
    postId: string,
    query: GetCommentsQueryInputDto,
    userId: string | undefined,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const { pageNumber, pageSize, sortBy, sortDirection } = query;

    const post = await this.postsQueryRepository.getByIdOrFail(postId);

    if (!post) {
      throw new NotFoundException('post does not exists');
    }

    const commentsByPost = await this.CommentModel.find({ postId })
      .sort({ [sortBy]: sortDirection })
      .skip(query.calculateSkip())
      .limit(pageSize)
      .lean();

    const totalCount = await this.CommentModel.countDocuments({ postId });

    // todo
    // const commentsIds = commentsByPost.map((el) => el._id.toString());
    // const myLikes = await this.likeQueryRepository.getUserLikes(
    //   userId,
    //   commentsIds,
    // );

    const commentsByPostView = commentsByPost.map((el) =>
      CommentViewDto.mapToView(el, {}),
    );

    return PaginatedViewDto.mapToView({
      page: pageNumber,
      totalCount,
      items: commentsByPostView,
      size: pageSize,
    });
  }
}
