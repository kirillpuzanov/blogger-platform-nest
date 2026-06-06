import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';

import { Post, type PostModelType } from '../domain/post.entity';
import { CreatePostDto } from '../dto/create-post.dto';
import { BlogsQueryRepository } from '../../blogs/infra/blogs.query.repository';
import { PostsRepository } from '../infra/posts.repository';

export class CreatePostCommand {
  constructor(public dto: CreatePostDto) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    @InjectModel(Post.modelName)
    private PostModel: PostModelType,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsRepository: PostsRepository,
  ) {}

  async execute({ dto }: CreatePostCommand): Promise<string> {
    const { content, shortDescription, title, blogId } = dto;
    const blog = await this.blogsQueryRepository.getByIdOrFail(blogId);

    const newPost = this.PostModel.createPost({
      blogId,
      content,
      shortDescription,
      title,
      blogName: blog.name,
      createdAt: new Date(),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        newestLikes: [],
      },
    });

    await this.postsRepository.save(newPost);
    return newPost._id.toString();
  }
}
