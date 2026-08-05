import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikeSqlDto } from '../domain/dto/like.sql-dto';
import { LikeStatus } from '../../../../core/dto/like-status';

export class LikeRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createLike(newLike: LikeSqlDto): Promise<void> {
    const { parent_id, user_id, user_login, status } = newLike;
    return this.dataSource.query<void>(
      `INSERT INTO likes
        (parent_id, user_id, user_login, status )
        VALUES ($1, $2, $3, $4)
        `,
      [parent_id, user_id, user_login, status],
    );
  }

  async updateLikeStatus(
    newLikeStatus: LikeStatus,
    likeId: string,
  ): Promise<void> {
    return this.dataSource.query<void>(
      `UPDATE likes
       SET status=$1,
        WHERE id=$2
        `,
      [newLikeStatus, likeId],
    );
  }

  async getLike(parentId: string, userId: string): Promise<LikeSqlDto> {
    const result = await this.dataSource.query<LikeSqlDto[]>(
      `SELECT * FROM likes WHERE parent_id=$1 AND user_id=$2`,
      [parentId, userId],
    );
    return result[0];
  }

  async getLastLikes(parentId: string, limit = 3): Promise<LikeSqlDto[]> {
    return this.dataSource.query<LikeSqlDto[]>(
      `
      SELECT * FROM likes
      WHERE parent_id = $1 AND status = $2
      ORDER BY created_at DESC
      LIMIT $2
    `,
      [parentId, LikeStatus.Like, limit],
    );
  }

  async deleteEntityAllLikes(parentId: string): Promise<void> {
    return this.dataSource.query(
      `
      DELETE FROM likes
      WHERE parent_id=$1`,
      [parentId],
    );
  }
}

//Mongoose
// export class LikeRepository {
//   constructor(@InjectModel(Like.modelName) private LikeModel: LikeModelType) {}
//
//   async save(like: LikeDocument) {
//     await like.save();
//   }
//
//   async getLike(
//     parentId: string,
//     userId: string,
//     session?: ClientSession,
//   ): Promise<LikeDocument | null> {
//     let query = this.LikeModel.findOne({
//       parentId,
//       'author.userId': userId,
//     });
//     if (session) {
//       query = query.session(session);
//     }
//     return query;
//   }
//
//   async getLastLikes(parentId: string, limit = 3): Promise<LikeDocument[]> {
//     return this.LikeModel.find({
//       parentId,
//       status: LikeStatus.Like,
//     })
//       .sort({ createdAt: -1 })
//       .limit(limit);
//   }
//
//   async deleteEntityAllLikes(parentId: string): Promise<void> {
//     await this.LikeModel.deleteMany({ parentId });
//   }
// }
