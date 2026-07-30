import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../infra/posts.repository';
import { UpdatePostDto } from '../dto/update-post.dto';

export class UpdatePostCommand {
  constructor(public dto: UpdatePostDto) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(private postsRepository: PostsRepository) {}

  async execute({ dto }: UpdatePostCommand): Promise<void> {
    const { title, blogId, content, shortDescription, postId } = dto;

    const post = await this.postsRepository.findByIdOrFail(postId);

    post.updatePost({ title, blogId, content, shortDescription });

    await this.postsRepository.save(post);
  }
}
