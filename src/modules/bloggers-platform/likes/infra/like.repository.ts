import { ClientSession } from 'mongoose';

import { Like, LikeDocument, type LikeModelType } from '../domain/like.entity';
import { InjectModel } from '@nestjs/mongoose';
import { LikeStatus } from '../../../../core/dto/like-status';

export class LikeRepository {
  constructor(@InjectModel(Like.modelName) private LikeModel: LikeModelType) {}

  async save(like: LikeDocument) {
    await like.save();
  }

  async getLike(
    parentId: string,
    userId: string,
    session?: ClientSession,
  ): Promise<LikeDocument | null> {
    let query = this.LikeModel.findOne({
      parentId,
      'author.userId': userId,
    });
    if (session) {
      query = query.session(session);
    }
    return query;
  }

  async getLastLikes(parentId: string, limit = 3): Promise<LikeDocument[]> {
    return this.LikeModel.find({
      parentId,
      status: LikeStatus.Like,
    })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async deleteEntityAllLikes(parentId: string): Promise<void> {
    await this.LikeModel.deleteMany({ parentId });
  }
}
