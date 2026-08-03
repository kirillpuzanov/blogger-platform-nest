import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostDto } from '../dto/create-post.dto';
import { BlogsQueryRepository } from '../../blogs/infra/blogs.query.repository';
import { PostsRepository } from '../infra/posts.repository';
import { PostSql } from '../domain/post.entity';

export class CreatePostCommand {
  constructor(public dto: CreatePostDto) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private postsRepository: PostsRepository,
  ) {}

  async execute({ dto }: CreatePostCommand): Promise<string> {
    const { content, shortDescription, title, blogId } = dto;
    const blog = await this.blogsQueryRepository.getByIdOrFail(blogId);
    const newPost = PostSql.createPost({
      blogId,
      content,
      shortDescription,
      title,
      blogName: blog.name,
      likesCount: 0,
      dislikesCount: 0,
    });

    const newPostId = await this.postsRepository.createPost(newPost);
    return newPostId;
  }
}
