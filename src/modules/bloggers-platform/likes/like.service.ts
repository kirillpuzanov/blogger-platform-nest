import { Injectable } from '@nestjs/common';
import { LikeRepository } from './infra/like.repository';
import { UsersRepository } from '../../user-accounts/users/infra/users.repository';
import { LikeStatus } from '../../../core/dto/like-status';
import { LikeCountUpdateDto } from './dto/like-count-update.dto';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Like, type LikeModelType } from './domain/like.entity';

@Injectable()
export class LikeService {
  constructor(
    @InjectModel(Like.modelName)
    private LikeModel: LikeModelType,
    private readonly usersRepository: UsersRepository, // todo external UsersRepository
    private readonly likeRepository: LikeRepository,
  ) {}

  async updateLike(
    userId: string,
    parentId: string,
    newLikeStatus: LikeStatus,
  ): Promise<LikeCountUpdateDto> {
    const session = await mongoose.startSession();
    session.startTransaction();

    let likesCountDelta: LikeCountUpdateDto = {};

    try {
      const existingLike = await this.likeRepository.getLike(
        parentId,
        userId,
        session,
      );
      /** доп проверка, если статус не изменился ничего не делаем */
      if (existingLike?.status === newLikeStatus) {
        await session.commitTransaction();
        return likesCountDelta;
      }

      /** если лайка нет - создадим */
      if (!existingLike) {
        const user = await this.usersRepository.getById(userId);
        const newLike = this.LikeModel.createLike({
          parentId,
          userId,
          userLogin: user?.login ?? 'unknown',
          status: newLikeStatus,
        });
        await this.likeRepository.save(newLike);
      } else {
        existingLike.updateLikeStatus(newLikeStatus);
        await this.likeRepository.save(existingLike);
      }

      /** считаем дельты для изменения счетчиков в parent-сущности */
      likesCountDelta = this.calculateCountersDelta(
        existingLike?.status,
        newLikeStatus,
      );

      await session.commitTransaction();

      return likesCountDelta;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async deleteEntityAllLikes(parentId: string): Promise<void> {
    await this.likeRepository.deleteEntityAllLikes(parentId);
  }

  private calculateCountersDelta(
    oldStatus: LikeStatus | undefined,
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
