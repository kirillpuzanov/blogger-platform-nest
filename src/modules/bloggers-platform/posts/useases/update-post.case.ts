import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostDto } from '../dto/create-post.dto';
import { PostsRepository } from '../infra/posts.repository';

export class UpdatePostCommand {
  constructor(
    public dto: CreatePostDto,
    public id: string,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(private postsRepository: PostsRepository) {}

  async execute({ dto, id }: UpdatePostCommand): Promise<void> {
    const { title, blogId, content, shortDescription } = dto;

    const post = await this.postsRepository.findByIdOrFail(id);

    post.updatePost({ title, blogId, content, shortDescription });

    await this.postsRepository.save(post);
  }
}
