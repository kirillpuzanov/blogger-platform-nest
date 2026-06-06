import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Comment } from '../../comments/domain/comment.entity';
import { LikeStatus } from '../../../../core/dto/like-status';
import { CreateLikeDto } from './create-like.dto';

@Schema({ _id: false })
export class LikeAuthor {
  @Prop({ type: String, require: true })
  userId: string;

  @Prop({ type: String, require: true })
  userLogin: string;
}

@Schema({ timestamps: true })
export class Like {
  @Prop({ type: String, require: true })
  parentId: string;

  @Prop({ type: Date, require: true })
  createdAt: Date;

  @Prop({ type: LikeStatus, require: true, default: 'None' })
  status: LikeStatus;

  @Prop({ type: LikeAuthor, require: true })
  author: LikeAuthor;

  static modelName = 'LikeModel';
  static collectionName = 'likes';

  static createLike(dto: CreateLikeDto) {
    const like = new this();
    like.parentId = dto.parentId;
    like.status = dto.status;
    like.createdAt = new Date();
    like.author.userId = dto.userId;
    like.author.userLogin = dto.userLogin;

    return like as LikeDocument;
  }

  updateLikeStatus(status: LikeStatus) {
    this.status = status;

    if (status !== LikeStatus.None) {
      this.createdAt = new Date();
    }
  }
}

export const LikeSchema = SchemaFactory.createForClass(Comment);
//регистрирует методы сущности в схеме
LikeSchema.loadClass(Comment);

//Типизация документа
export type LikeDocument = HydratedDocument<Like>;

//Типизация модели + статические методы
export type LikeModelType = Model<LikeDocument> & typeof Like;
