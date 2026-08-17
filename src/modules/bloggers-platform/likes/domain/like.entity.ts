import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikeStatus } from '../../../../core/dto/like-status';
import { CreateLikeDto } from './create-like.dto';
import { LikeSqlDto } from './dto/like.sql-dto';

export class LikeSql implements LikeSqlDto {
  id: string;
  parent_id: string;
  user_id: string;
  user_login: string;
  status: LikeStatus;
  created_at: Date;

  static createLike(dto: CreateLikeDto): LikeSqlDto {
    const like = new this();
    like.parent_id = dto.parentId;
    like.user_id = dto.userId;
    like.user_login = dto.userLogin;
    like.status = dto.status;

    return like;
  }
}

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

  @Prop({
    type: String,
    enum: Object.values(LikeStatus),
    require: true,
    default: LikeStatus.None,
  })
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
    like.author = {
      userId: dto.userId,
      userLogin: dto.userLogin,
    };

    return like as LikeDocument;
  }

  updateLikeStatus(status: LikeStatus) {
    this.status = status;

    if (status !== LikeStatus.None) {
      this.createdAt = new Date();
    }
  }
}

export const LikeSchema = SchemaFactory.createForClass(Like);
//регистрирует методы сущности в схеме
LikeSchema.loadClass(Like);

//Типизация документа
export type LikeDocument = HydratedDocument<Like>;

//Типизация модели + статические методы
export type LikeModelType = Model<LikeDocument> & typeof Like;
