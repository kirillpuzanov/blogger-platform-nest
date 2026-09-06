import { Injectable } from '@nestjs/common';
import { LikeStatus } from '../../../../core/dto/like-status';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikeSqlDto } from '../domain/dto/like.sql-dto';
import { NewestLikeSqlDto } from '../../posts/domain/newest-like-sql.dto';

@Injectable()
export class LikeQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getUserLikes(
    userId: string | undefined,
    entityIds: string[],
  ): Promise<Record<string, LikeStatus>> {
    const userLikes = {} as Record<string, LikeStatus>;

    if (userId) {
      const userLikes = await this.dataSource.query<LikeSqlDto[]>(
        `
         SELECT  parent_id, status FROM likes
         WHERE user_id = $1 AND parent_id = ANY($2)
         `,
        [userId, entityIds],
      );

      if (userLikes.length > 0) {
        userLikes.forEach((el) => {
          userLikes[el.parent_id] = el.status;
        });
      }
    }

    return userLikes;
  }

  async getNewestLikesForManyPosts(
    postsIds: string[],
  ): Promise<NewestLikeSqlDto[]> {
    return this.dataSource.query<NewestLikeSqlDto[]>(
      `
      SELECT  parent_id, user_id, user_login, created_at
      FROM (
        SELECT 
          parent_id,
          user_id,
          user_login,
          created_at,
          ROW_NUMBER() OVER (PARTITION BY parent_id ORDER BY created_at DESC) as rn
        FROM likes
        WHERE parent_id = ANY($1) AND status = $2
      ) ranked
      WHERE rn <= 3
      ORDER BY parent_id, created_at DESC
    `,
      [postsIds, LikeStatus.Like],
    );
  }
}
