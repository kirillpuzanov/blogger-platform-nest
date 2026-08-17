import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../infra/comments.repository';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain.exception';

export class UpdateCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
    public content: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommand> {
  constructor(private commentsRepository: CommentsRepository) {}

  async execute({
    userId,
    commentId,
    content,
  }: UpdateCommentCommand): Promise<void> {
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

    await this.commentsRepository.updateComment(content, comment.id);
  }
}
