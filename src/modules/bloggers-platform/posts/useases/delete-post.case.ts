import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../infra/posts.repository';
import { CommentsRepository } from '../../comments/infra/comments.repository';
import { BlogsRepository } from '../../blogs/infra/blogs.repository';

export class DeletePostCommand {
  constructor(
    public postId: string,
    public blogId: string,
  ) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
    private commentsRepository: CommentsRepository,
  ) {}

  async execute({ postId, blogId }: DeletePostCommand): Promise<void> {
    await this.blogsRepository.findByIdOrFail(blogId);
    await this.postsRepository.findByIdOrFail(postId);

    await this.postsRepository.deleteById(postId);

    // todo
    // /** удаляем комментарии привязанные к этому посту */
    // await this.commentsRepository.deleteMany(id);
  }
}
