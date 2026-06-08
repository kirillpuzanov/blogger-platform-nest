import { ObjectId } from 'mongodb';
import {
  Comment,
  CommentDocument,
  type CommentModelType,
} from '../domain/comment.entity';
import { Injectable } from '@nestjs/common';
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
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'comment not found',
      });
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

  async deleteMany(parentId: string): Promise<void> {
    await this.CommentModel.deleteMany({ postId: parentId });
  }

  async save(comment: CommentDocument) {
    await comment.save();
  }
}
