import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Like, type LikeModelType } from '../domain/like.entity';
import { LikeStatus } from '../../../../core/dto/like-status';

@Injectable()
export class LikeQueryRepository {
  constructor(@InjectModel(Like.modelName) private LikeModel: LikeModelType) {}

  async getUserLikes(
    userId: string | undefined,
    entityIds: string[],
  ): Promise<Record<string, LikeStatus>> {
    const myLikes = {} as Record<string, LikeStatus>;

    if (userId) {
      const userLikes = await this.LikeModel.find({
        'author.userId': userId,
        parentId: { $in: entityIds },
      }).lean();

      if (userLikes.length > 0) {
        userLikes.forEach((el) => {
          myLikes[el.parentId] = el.status;
        });
      }
    }

    return myLikes;
  }
}
