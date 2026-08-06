import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../infra/comments.repository';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain.exception';
import { LikeService } from '../../likes/like.service';

export class DeleteCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase implements ICommandHandler<DeleteCommentCommand> {
  constructor(
    private commentsRepository: CommentsRepository,
    private likeService: LikeService,
  ) {}

  async execute({ userId, commentId }: DeleteCommentCommand): Promise<void> {
    const comment = await this.commentsRepository.findByIdOrFail(commentId);

    /** такого коммента нет в БД */
    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'comment not found',
      });
    }

    /** комментарий был создан не этим пользователем */
    if (comment.user_id !== userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'no access',
      });
    }

    await this.commentsRepository.deleteOne(commentId);
    await this.likeService.deleteEntityAllLikes(commentId);
  }
}
