import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../infra/comments.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

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
      throw new NotFoundException('comment not found');
    }

    /** комментарий был создан не этим пользователем */
    if (comment.commentatorInfo?.userId !== userId) {
      throw new ForbiddenException();
    }

    comment.updateComment(content);
    await this.commentsRepository.save(comment);
  }
}
