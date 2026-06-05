import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, type BlogModelType } from '../domain/blog.entity';
import { BlogsRepository } from '../infra/blogs.repository';
import { CreateBlogDto } from '../dto/create-blog.dto';

export class CreateBlogCommand {
  constructor(public dto: CreateBlogDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    @InjectModel(Blog.modelName)
    private BlogModel: BlogModelType,
    private blogsRepository: BlogsRepository,
  ) {}

  async execute({ dto }: CreateBlogCommand): Promise<string> {
    const newBlog = this.BlogModel.createBlog({
      websiteUrl: dto.websiteUrl,
      description: dto.description,
      name: dto.name,
    });

    await this.blogsRepository.save(newBlog);
    return newBlog._id.toString();
  }
}
