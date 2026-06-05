import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../infra/blogs.repository';

export class DeleteBlogCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute({ id }: DeleteBlogCommand): Promise<void> {
    await this.blogsRepository.deleteById(id);

    // todo
    // /** удаляем посты привязанные к этому блогу */
    // await this.postsService.deleteManyPost({ blogId: id });
    //
    // todo
    // /** удаляем комментарии привязанные постам блога */
    // await this.commentService.deleteManyComments({ blogId: id });
    return;
  }
}
