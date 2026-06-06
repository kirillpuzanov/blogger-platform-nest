import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../infra/comments.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class DeleteCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase implements ICommandHandler<DeleteCommentCommand> {
  constructor(private commentsRepository: CommentsRepository) {}

  async execute({ userId, commentId }: DeleteCommentCommand): Promise<void> {
    const comment = await this.commentsRepository.findByIdOrFail(commentId);

    /** такого коммента нет в БД */
    if (!comment) {
      throw new NotFoundException('comment not found');
    }

    /** комментарий был создан не этим пользователем */
    if (comment.commentatorInfo?.userId !== userId) {
      throw new ForbiddenException();
    }

    await this.commentsRepository.deleteOne(commentId);
  }
}
