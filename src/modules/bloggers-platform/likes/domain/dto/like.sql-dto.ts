import { LikeStatus } from '../../../../../core/dto/like-status';

export class LikeSqlDto {
  id: string;
  parent_id: string;
  user_id: string;
  user_login: string;
  status: LikeStatus;
  created_at: Date;
}
