import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogSql } from '../domain/blog.entity';
import { BlogsRepository } from '../infra/blogs.repository';
import { CreateBlogDto } from '../dto/create-blog.dto';

export class CreateBlogCommand {
  constructor(public dto: CreateBlogDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute({ dto }: CreateBlogCommand): Promise<string> {
    const blog = BlogSql.createBlog({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    });
    return this.blogsRepository.createBlog(blog);
  }
}
