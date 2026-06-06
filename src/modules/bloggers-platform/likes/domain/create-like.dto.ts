import { LikeStatus } from '../../../../core/dto/like-status';

export class CreateLikeDto {
  parentId: string;
  userId: string;
  userLogin: string;
  status: LikeStatus;
}
