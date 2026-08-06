import { LikeSqlDto } from '../../likes/domain/dto/like.sql-dto';

export class NewestLikeSqlDto {
  post_id: string;
  user_id: string;
  user_login: string;
  created_at: Date;

  static createNewestLikeSqlDto(
    dto: LikeSqlDto,
    post_id: string,
  ): NewestLikeSqlDto {
    const { user_id, user_login, created_at } = dto;
    const newestLike = new this();

    newestLike.post_id = post_id;
    newestLike.user_id = user_id;
    newestLike.user_login = user_login;
    newestLike.created_at = created_at;

    return newestLike;
  }
}
