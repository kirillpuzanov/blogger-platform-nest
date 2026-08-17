import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../infra/comments.repository';
import { LikeStatus } from '../../../../core/dto/like-status';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain.exception';
import { LikeService } from '../../likes/like.service';

export class UpdateCommentLikeCommand {
  constructor(
    public commentId: string,
    public userId: string,
    public newLikeStatus: LikeStatus,
  ) {}
}

@CommandHandler(UpdateCommentLikeCommand)
export class UpdateCommentLikeUseCase implements ICommandHandler<UpdateCommentLikeCommand> {
  constructor(
    private commentsRepository: CommentsRepository,
    private likeService: LikeService,
  ) {}

  async execute({
    userId,
    commentId,
    newLikeStatus,
  }: UpdateCommentLikeCommand): Promise<void> {
    const comment = await this.commentsRepository.findByIdOrFail(commentId);

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'comment not found',
      });
    }

    /** обновляем лайк / получаем дельту для изменения счетчика */
    const likeCountData = await this.likeService.updateLike(
      userId,
      commentId,
      newLikeStatus,
    );

    /** обновляем счетчик лайков комментария */
    if (likeCountData && Object.keys(likeCountData).length > 0) {
      await this.commentsRepository.updateLikeCount(
        commentId,
        likeCountData.likesCount ?? 0,
        likeCountData.dislikesCount ?? 0,
      );
    }
  }
}
