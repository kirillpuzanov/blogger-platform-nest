import { ObjectId } from 'mongodb';
import {
  Comment,
  CommentDocument,
  type CommentModelType,
} from '../domain/comment.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain.exception';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.modelName)
    private CommentModel: CommentModelType,
  ) {}

  async findByIdOrFail(id: string): Promise<CommentDocument> {
    const comment = await this.CommentModel.findOne({ _id: new ObjectId(id) });

    if (!comment) {
      throw new NotFoundException('comment not found');
    }
    return comment;
  }

  async deleteOne(commentId: string): Promise<void> {
    const res = await this.CommentModel.deleteOne({
      _id: new ObjectId(commentId),
    });

    if (res.deletedCount < 1) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'comment not found',
      });
    }
  }

  async save(comment: CommentDocument) {
    await comment.save();
  }

  // async create(comment: CommentDb): Promise<string> {
  //   const createdComment = await this.CommentModel.insertOne(comment);
  //   return createdComment._id.toString();
  // }
  //
  // async update(commentId: string, content: string): Promise<number> {
  //   const updatedComment = await CommentModel.updateOne(
  //     { _id: new ObjectId(commentId) },
  //     { $set: { content } },
  //   );
  //   return updatedComment.matchedCount;
  // }

  // async updateLikes(
  //   commentId: string,
  //   likeUpdateDelta: Record<string, number>,
  // ): Promise<number> {
  //   const updatedComment = await CommentModel.updateOne(
  //     { _id: new ObjectId(commentId) },
  //     { $inc: likeUpdateDelta },
  //   );
  //   return updatedComment.matchedCount;
  // }
  //
}
