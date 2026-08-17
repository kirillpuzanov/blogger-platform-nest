import { LikeStatus } from '../../../../../core/dto/like-status';
import { CommentDocument } from '../../domain/comment.entity';
import { CommentSqlDto } from '../../domain/comment.sql-dto';

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

  static mapToViewSql(
    comment: CommentSqlDto,
    userLikes: Record<string, LikeStatus>,
  ): CommentViewDto {
    const dto = new CommentViewDto();

    dto.id = comment.id;
    dto.content = comment.content;
    dto.createdAt = comment.created_at;

    dto.commentatorInfo = {
      userId: comment.user_id,
      userLogin: comment.user_login,
    };

    dto.likesInfo = {
      likesCount: comment.likes_count || 0,
      dislikesCount: comment.dislikes_count || 0,
      myStatus: userLikes[dto.id] ?? LikeStatus.None,
    };

    return dto;
  }
}
