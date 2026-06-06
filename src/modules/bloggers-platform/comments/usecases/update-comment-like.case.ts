import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../infra/comments.repository';
import { LikeStatus } from '../../../../core/dto/like-status';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain.exception';

export class UpdateCommentLikeCommand {
  constructor(
    public commentId: string,
    public userId: string,
    public newLikeStatus: LikeStatus,
  ) {}
}

@CommandHandler(UpdateCommentLikeCommand)
export class UpdateCommentLikeUseCase implements ICommandHandler<UpdateCommentLikeCommand> {
  constructor(private commentsRepository: CommentsRepository) {}

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

    // todo;
    // /** обновляем лайк / получаем дельту для изменения счетчика */
    // const { status, data } = await this.likeService.updateLike(
    //   userId,
    //   commentId,
    //   newLikeStatus,
    // );
    //
    // /** обновляем счетчик лайков комментария */
    // if (
    //   data &&
    //   status === ResultStatus.NoContent &&
    //   Object.keys(data).length > 0
    // ) {
    //   comment.updateLikeCount(data.likesCount ?? 0, data.dislikesCount ?? 0);
    //
    //   await this.commentsRepository.save(comment);
    // }
  }
}
