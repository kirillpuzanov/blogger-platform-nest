import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CommentatorInfo, LikesInfo } from './comment-additional.schema';
import { HydratedDocument, Model } from 'mongoose';

export const commentContentConstraints = {
  minLength: 20,
  maxLength: 300,
};

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: String, require: true })
  blogId: string;

  @Prop({ type: String, require: true })
  postId: string;

  @Prop({ type: String, require: true, ...commentContentConstraints })
  content: string;

  @Prop({ type: Date, require: true })
  createdAt: Date;

  @Prop({ type: CommentatorInfo, require: true })
  commentatorInfo: CommentatorInfo;

  @Prop({ type: LikesInfo, require: false })
  likesInfo: LikesInfo;

  static modelName = 'CommentModel';
  static collectionName = 'comments';

  static createComment() {}

  updateComment(content: string) {
    this.content = content;
  }

  updateLikeCount(likesCount: number, dislikesCount: number) {
    this.likesInfo.likesCount = likesCount;
    this.likesInfo.dislikesCount = dislikesCount;
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
//регистрирует методы сущности в схеме
CommentSchema.loadClass(Comment);

//Типизация документа
export type CommentDocument = HydratedDocument<Comment>;

//Типизация модели + статические методы
export type CommentModelType = Model<CommentDocument> & typeof Comment;
