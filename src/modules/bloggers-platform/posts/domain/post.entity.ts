import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreatePostDto } from '../dto/create-post.dto';
import { CreatePostDomainDto } from './create-post.domain-dto';

@Schema({ _id: false })
export class NewestLike {
  @Prop({ type: String, require: true })
  addedAt: string;

  @Prop({ type: String, require: true })
  userId: string;

  @Prop({ type: String, require: true })
  login: string;
}

@Schema({ _id: false })
export class ExtendedLikesInfo {
  @Prop({ type: Number, require: true })
  likesCount: number;

  @Prop({ type: Number, require: true })
  dislikesCount: number;

  @Prop({ type: [NewestLike], require: true })
  newestLikes: NewestLike[];
}

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: String, require: true })
  title: string;

  @Prop({ type: String, require: true })
  shortDescription: string;

  @Prop({ type: String, require: true })
  content: string;

  @Prop({ type: String, require: true })
  blogId: string;

  @Prop({ type: String, require: true })
  blogName: string;

  @Prop({ type: Date, require: true })
  createdAt: Date;

  @Prop({ type: ExtendedLikesInfo, require: true })
  extendedLikesInfo: ExtendedLikesInfo;

  static modelName = 'PostModel';
  static collectionName = 'posts';

  static createPost(dto: CreatePostDomainDto): PostDocument {
    const post = new this();

    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = dto.blogId;
    post.blogName = dto.blogName;
    post.createdAt = dto.createdAt;
    post.extendedLikesInfo = dto.extendedLikesInfo;

    return post as PostDocument;
  }

  updatePost(dto: CreatePostDto) {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
    this.blogId = dto.blogId;
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);
//регистрирует методы сущности в схеме
PostSchema.loadClass(Post);

//Типизация документа
export type PostDocument = HydratedDocument<Post>;

//Типизация модели + статические методы
export type PostModelType = Model<PostDocument> & typeof Post;
