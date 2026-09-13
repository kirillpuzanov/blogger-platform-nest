import { Injectable } from '@nestjs/common';
import { LikeStatus } from '../../../../core/dto/like-status';
import { NewestLikeSqlDto } from '../../posts/domain/newest-like-sql.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { LikeSqlDto, LikeTypeOrm } from '../domain/like.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class LikeQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(LikeTypeOrm) private likeRepo: Repository<LikeTypeOrm>,
  ) {}

  async getUserLikes(
    userId: string | undefined,
    entityIds: string[],
  ): Promise<Record<string, LikeStatus>> {
    const userLikesDict = {} as Record<string, LikeStatus>;

    if (userId && entityIds.length > 0) {
      const userLikes = await this.likeRepo
        .createQueryBuilder('l')
        .select(['l.parent_id as parent_id', 'l.status as status'])
        .where('l.user_id = :userId', { userId })
        .andWhere('l.parent_id = ANY(:entityIds)', { entityIds })
        .getRawMany<LikeSqlDto>();

      if (!userLikes.length) {
        return userLikesDict;
      }
      userLikes.forEach((el) => {
        userLikesDict[el.parent_id] = el.status;
      });
    }

    return userLikesDict;
  }

  // todo -- ??
  async getNewestLikesForManyPosts(
    postsIds: string[],
  ): Promise<NewestLikeSqlDto[]> {
    if (postsIds.length === 0) {
      return [];
    }

    const result = await this.dataSource
      .createQueryBuilder()
      .select([
        'ranked.parent_id',
        'ranked.user_id',
        'ranked.user_login',
        'ranked.created_at',
      ])
      .from(
        (subQuery) =>
          subQuery
            .select([
              'l.parent_id as parent_id',
              'l.user_id as user_id',
              'l.user_login as user_login',
              'l.created_at as created_at',
              'ROW_NUMBER() OVER (PARTITION BY l.parent_id ORDER BY l.created_at DESC) as rn',
            ])
            .from(LikeTypeOrm, 'l') // ✅ Явно указываем таблицу
            .where('l.parent_id = ANY(:postsIds)', { postsIds })
            .andWhere('l.status = :status', { status: LikeStatus.Like }),
        'ranked',
      )
      .where('ranked.rn <= 3')
      .orderBy('ranked.parent_id', 'ASC')
      .addOrderBy('ranked.created_at', 'DESC')
      .getRawMany();

    return result;
  }
}

//Row Sql
//
// @Injectable()
// export class LikeQueryRepository {
//   constructor(@InjectDataSource() protected dataSource: DataSource) {}
//
//   async getUserLikes(
//     userId: string | undefined,
//     entityIds: string[],
//   ): Promise<Record<string, LikeStatus>> {
//     const userLikes = {} as Record<string, LikeStatus>;
//
//     if (userId) {
//       const userLikes = await this.dataSource.query<LikeSqlDto[]>(
//         `
//          SELECT  parent_id, status FROM likes
//          WHERE user_id = $1 AND parent_id = ANY($2)
//          `,
//         [userId, entityIds],
//       );
//
//       if (userLikes.length > 0) {
//         userLikes.forEach((el) => {
//           userLikes[el.parent_id] = el.status;
//         });
//       }
//     }
//
//     return userLikes;
//   }
//
//   async getNewestLikesForManyPosts(
//     postsIds: string[],
//   ): Promise<NewestLikeSqlDto[]> {
//     return this.dataSource.query<NewestLikeSqlDto[]>(
//       `
//       SELECT  parent_id, user_id, user_login, created_at
//       FROM (
//         SELECT
//           parent_id,
//           user_id,
//           user_login,
//           created_at,
//           ROW_NUMBER() OVER (PARTITION BY parent_id ORDER BY created_at DESC) as rn
//         FROM likes
//         WHERE parent_id = ANY($1) AND status = $2
//       ) ranked
//       WHERE rn <= 3
//       ORDER BY parent_id, created_at DESC
//     `,
//       [postsIds, LikeStatus.Like],
//     );
//   }
// }
