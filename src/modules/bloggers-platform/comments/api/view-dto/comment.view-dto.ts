import { LikeStatus } from '../../../../../core/dto/like-status';
import { CommentDocument } from '../../domain/comment.entity';

export class CommentViewDto {
  id: string;
  content: string;

  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: Date;

  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
  };

  static mapToView(
    comment: CommentDocument,
    userLikes: Record<string, LikeStatus>,
  ): CommentViewDto {
    const dto = new CommentViewDto();

    dto.id = comment._id.toString();
    dto.content = comment.content;
    dto.createdAt = comment.createdAt;

    dto.commentatorInfo = {
      userId: comment.commentatorInfo.userId,
      userLogin: comment.commentatorInfo.userLogin,
    };

    dto.likesInfo = {
      likesCount: comment.likesInfo.likesCount || 0,
      dislikesCount: comment.likesInfo.dislikesCount || 0,
      myStatus: userLikes[dto.id] ?? LikeStatus.None,
    };

    return dto;
  }
}
