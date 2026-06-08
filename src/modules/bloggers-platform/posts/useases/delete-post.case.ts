import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../infra/posts.repository';
import { CommentsRepository } from '../../comments/infra/comments.repository';

export class DeletePostCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    private postsRepository: PostsRepository,
    private commentsRepository: CommentsRepository,
  ) {}

  async execute({ id }: DeletePostCommand): Promise<void> {
    await this.postsRepository.deleteById(id);
    /** удаляем комментарии привязанные к этому посту */
    await this.commentsRepository.deleteMany(id);
  }
}
