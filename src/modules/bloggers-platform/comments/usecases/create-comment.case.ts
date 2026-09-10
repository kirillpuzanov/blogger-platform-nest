import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../infra/comments.repository';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { PostsRepository } from '../../posts/infra/posts.repository';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain.exception';
import { UsersExternalRepository } from '../../../user-accounts/users/infra/users-external.repository';
import { CommentTypeOrm } from '../domain/comment.entity';

export class CreateCommentCommand {
  constructor(public dto: CreateCommentDto) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<CreateCommentCommand> {
  constructor(
    private commentsRepository: CommentsRepository,
    private postsRepository: PostsRepository,
    private usersExternalRepository: UsersExternalRepository,
  ) {}

  async execute({ dto }: CreateCommentCommand): Promise<string> {
    const { userId, content, postId } = dto;

    const post = await this.postsRepository.findByIdOrFail(postId);
    const user = await this.usersExternalRepository.getById(userId);

    if (!post || !user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'user or post not found',
      });
    }

    const newComment = CommentTypeOrm.createComment({
      blogId: post.blog_id,
      content,
      postId,
      login: user.login,
      userId: user.id,
    });

    const newCommentsId = await this.commentsRepository.save(newComment);

    return newCommentsId;
  }
}
