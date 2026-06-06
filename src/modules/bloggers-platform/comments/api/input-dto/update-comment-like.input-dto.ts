import { IsEnum } from 'class-validator';
import { LikeStatus } from '../../../../../core/dto/like-status';

export class UpdateCommentLikeInputDto {
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}
