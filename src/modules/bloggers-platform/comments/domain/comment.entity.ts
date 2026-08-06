import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CommentatorInfo, LikesInfo } from './comment-additional.schema';
import { HydratedDocument, Model } from 'mongoose';
import {
  CreateCommentDomainDto,
  CreateCommentSqlDomainDto,
} from '../dto/create-comment.dto';
import { CommentSqlDto } from './comment.sql-dto';

export const commentContentConstraints = {
  minLength: 20,
  maxLength: 300,
};

export class CommentSql implements CommentSqlDto {
  id: string;
  blog_id: string;
  post_id: string;
  content: string;
  user_id: string;
  user_login: string;
  created_at: Date;
  likes_count: number;
  dislikes_count: number;

  static createComment(dto: CreateCommentSqlDomainDto): CommentSqlDto {
    const comment = new this();

    comment.post_id = dto.postId;
    comment.blog_id = dto.blogId;
    comment.content = dto.content;
    comment.user_id = dto.userId;
    comment.user_login = dto.login;
    comment.likes_count = 0;
    comment.dislikes_count = 0;

    return comment;
  }
}

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

  static createComment(dto: CreateCommentDomainDto) {
    const comment = new this();

    comment.postId = dto.postId;
    comment.content = dto.content;
    comment.blogId = dto.blogId;
    comment.commentatorInfo = {
      userId: dto.userId,
      userLogin: dto.login,
    };
    comment.createdAt = new Date();
    comment.likesInfo = {
      likesCount: 0,
      dislikesCount: 0,
    };

    return comment as CommentDocument;
  }

  updateComment(content: string) {
    this.content = content;
  }

  updateLikeCount(likesCount: number, dislikesCount: number) {
    this.likesInfo.likesCount = this.likesInfo.likesCount + likesCount;
    this.likesInfo.dislikesCount = this.likesInfo.dislikesCount + dislikesCount;
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
//регистрирует методы сущности в схеме
CommentSchema.loadClass(Comment);

//Типизация документа
export type CommentDocument = HydratedDocument<Comment>;

//Типизация модели + статические методы
export type CommentModelType = Model<CommentDocument> & typeof Comment;
