import { IsEnum } from 'class-validator';
import { LikeStatus } from '../../../../../core/dto/like-status';

export class UpdatePostLikeInputDto {
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}
