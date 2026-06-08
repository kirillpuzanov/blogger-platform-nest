import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../infra/blogs.repository';
import { CreateBlogInputDto } from '../api/input-dto/create-blog.input-dto';
import { PostsRepository } from '../../posts/infra/posts.repository';

export class UpdateBlogCommand {
  constructor(
    public dto: CreateBlogInputDto,
    public id: string,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {}

  async execute({ dto, id }: UpdateBlogCommand): Promise<void> {
    const blog = await this.blogsRepository.findByIdOrFail(id);
    const oldBlogName = blog.name;

    blog.updateBlog(dto);
    await this.blogsRepository.save(blog);

    if (oldBlogName !== dto.name) {
      /** обновим имя блога в привязанных к нему постах */
      await this.postsRepository.updateMany(
        { blogId: id },
        { blogName: dto.name },
      );
    }
  }
}
