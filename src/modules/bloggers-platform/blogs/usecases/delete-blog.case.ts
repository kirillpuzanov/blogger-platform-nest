import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../infra/blogs.repository';
import { PostsRepository } from '../../posts/infra/posts.repository';
import { CommentsRepository } from '../../comments/infra/comments.repository';

export class DeleteBlogCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
    private commentsRepository: CommentsRepository,
  ) {}

  async execute({ id }: DeleteBlogCommand): Promise<void> {
    await this.blogsRepository.deleteById(id);

    /** удаляем посты привязанные к этому блогу */

    /** должны удалиться каскадом за счет связи + onDelete: CASCADE */
    // await this.postsRepository.deleteMany(id);

    await this.commentsRepository.deleteMany(id);
  }
}
