import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../infra/comments.repository';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { PostsRepository } from '../../posts/infra/posts.repository';
import { UsersRepository } from '../../../user-accounts/users/infra/users.repository';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain.exception';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, type CommentModelType } from '../domain/comment.entity';

export class CreateCommentCommand {
  constructor(public dto: CreateCommentDto) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<CreateCommentCommand> {
  constructor(
    @InjectModel(Comment.modelName) private CommentModel: CommentModelType,
    private commentsRepository: CommentsRepository,
    private postsRepository: PostsRepository,
    private usersRepository: UsersRepository, // todo external
  ) {}

  async execute({ dto }: CreateCommentCommand): Promise<string> {
    const { userId, content, postId } = dto;

    const post = await this.postsRepository.findByIdOrFail(postId);
    const user = await this.usersRepository.getById(userId);

    if (!post || !user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'user or post not found',
      });
    }

    const newComment = this.CommentModel.createComment({
      blogId: post.blogId,
      content,
      postId,
      login: user.login,
      userId: user.id,
    });

    await this.commentsRepository.save(newComment);

    return newComment._id.toString();
  }
}
