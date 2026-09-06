import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../infra/posts.repository';
import { UpdatePostDto } from '../dto/update-post.dto';
import { BlogsRepository } from '../../blogs/infra/blogs.repository';

export class UpdatePostCommand {
  constructor(public dto: UpdatePostDto) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    private postsRepository: PostsRepository,
    private blogRepository: BlogsRepository,
  ) {}

  async execute({ dto }: UpdatePostCommand): Promise<string> {
    const { title, content, shortDescription, postId, blogId } = dto;

    await this.blogRepository.findByIdOrFail(blogId);
    const post = await this.postsRepository.findByIdOrFail(postId);

    const updatedPost = post.updatePost({
      title,
      content,
      short_description: shortDescription,
    });

    return await this.postsRepository.save(updatedPost);
  }
}
