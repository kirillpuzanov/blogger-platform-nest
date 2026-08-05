import { Injectable } from '@nestjs/common';
import { LikeStatus } from '../../../../core/dto/like-status';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikeSqlDto } from '../domain/dto/like.sql-dto';

@Injectable()
export class LikeQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getUserLikes(
    userId: string | undefined,
    entityIds: string[],
  ): Promise<Record<string, LikeStatus>> {
    const myLikes = {} as Record<string, LikeStatus>;

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
          myLikes[el.parent_id] = el.status;
        });
      }
    }

    return myLikes;
  }
}
