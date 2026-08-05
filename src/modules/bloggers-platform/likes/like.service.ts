import { Injectable } from '@nestjs/common';
import { LikeRepository } from './infra/like.repository';
import { LikeStatus } from '../../../core/dto/like-status';
import { LikeCountUpdateDto } from './dto/like-count-update.dto';
import { UsersExternalRepository } from '../../user-accounts/users/infra/users-external.repository';
import { LikeSql } from './domain/like.entity';

@Injectable()
export class LikeService {
  constructor(
    private readonly usersExternalRepository: UsersExternalRepository,
    private readonly likeRepository: LikeRepository,
  ) {}

  async updateLike(
    userId: string,
    parentId: string,
    newLikeStatus: LikeStatus,
  ): Promise<LikeCountUpdateDto> {
    let likesCountDelta: LikeCountUpdateDto = {};

    const existingLike = await this.likeRepository.getLike(parentId, userId);
    /** доп проверка, если статус не изменился ничего не делаем */
    if (existingLike?.status === newLikeStatus) {
      return likesCountDelta;
    }

    /** считаем дельты для изменения счетчиков в parent-сущности */
    likesCountDelta = this.calculateCountersDelta(
      existingLike?.status,
      newLikeStatus,
    );

    /** если лайка нет - создадим */
    if (!existingLike) {
      const user = await this.usersExternalRepository.getById(userId);
      const newLike = LikeSql.createLike({
        parentId,
        userId,
        userLogin: user?.login ?? 'unknown',
        status: newLikeStatus,
      });
      await this.likeRepository.createLike(newLike);
    } else {
      await this.likeRepository.updateLikeStatus(
        newLikeStatus,
        existingLike.id,
      );
    }

    return likesCountDelta;
  }

  async deleteEntityAllLikes(parentId: string): Promise<void> {
    await this.likeRepository.deleteEntityAllLikes(parentId);
  }

  private calculateCountersDelta(
    oldStatus: LikeStatus,
    newStatus: LikeStatus,
  ): LikeCountUpdateDto {
    let likesCount = 0;
    let dislikesCount = 0;

    const delta: LikeCountUpdateDto = {};

    /** Убираем старый статус */
    if (oldStatus === LikeStatus.Like) likesCount--;
    if (oldStatus === LikeStatus.Dislike) dislikesCount--;

    /** Добавляем новый статус */
    if (newStatus === LikeStatus.Like) likesCount++;
    if (newStatus === LikeStatus.Dislike) dislikesCount++;

    if (likesCount !== 0) {
      delta.likesCount = likesCount;
    }

    if (dislikesCount !== 0) {
      delta.dislikesCount = dislikesCount;
    }

    return delta;
  }
}

// Mongoose
// @Injectable()
// export class LikeService {
//   constructor(
//     @InjectModel(Like.modelName)
//     private LikeModel: LikeModelType,
//     private readonly usersExternalRepository: UsersExternalRepository,
//     private readonly likeRepository: LikeRepository,
//   ) {}
//
//   async updateLike(
//     userId: string,
//     parentId: string,
//     newLikeStatus: LikeStatus,
//   ): Promise<LikeCountUpdateDto> {
//     const session = await this.LikeModel.db.startSession();
//
//     session.startTransaction();
//
//     let likesCountDelta: LikeCountUpdateDto = {};
//
//     try {
//       const existingLike = await this.likeRepository.getLike(
//         parentId,
//         userId,
//         session,
//       );
//       /** доп проверка, если статус не изменился ничего не делаем */
//       if (existingLike?.status === newLikeStatus) {
//         await session.commitTransaction();
//         return likesCountDelta;
//       }
//
//       /** считаем дельты для изменения счетчиков в parent-сущности */
//       likesCountDelta = this.calculateCountersDelta(
//         existingLike?.status,
//         newLikeStatus,
//       );
//
//       /** если лайка нет - создадим */
//       if (!existingLike) {
//         const user = await this.usersExternalRepository.getById(userId);
//         const newLike = this.LikeModel.createLike({
//           parentId,
//           userId,
//           userLogin: user?.login ?? 'unknown',
//           status: newLikeStatus,
//         });
//         await this.likeRepository.save(newLike);
//       } else {
//         existingLike.updateLikeStatus(newLikeStatus);
//         await this.likeRepository.save(existingLike);
//       }
//
//       await session.commitTransaction();
//
//       return likesCountDelta;
//     } catch (error) {
//       await session.abortTransaction();
//       throw error;
//     } finally {
//       await session.endSession();
//     }
//   }
//
//   async deleteEntityAllLikes(parentId: string): Promise<void> {
//     await this.likeRepository.deleteEntityAllLikes(parentId);
//   }
//
//   private calculateCountersDelta(
//     oldStatus: LikeStatus | undefined,
//     newStatus: LikeStatus,
//   ): LikeCountUpdateDto {
//     let likesCount = 0;
//     let dislikesCount = 0;
//
//     const delta: LikeCountUpdateDto = {};
//
//     /** Убираем старый статус */
//     if (oldStatus === LikeStatus.Like) likesCount--;
//     if (oldStatus === LikeStatus.Dislike) dislikesCount--;
//
//     /** Добавляем новый статус */
//     if (newStatus === LikeStatus.Like) likesCount++;
//     if (newStatus === LikeStatus.Dislike) dislikesCount++;
//
//     if (likesCount !== 0) {
//       delta.likesCount = likesCount;
//     }
//
//     if (dislikesCount !== 0) {
//       delta.dislikesCount = dislikesCount;
//     }
//
//     return delta;
//   }
// }
