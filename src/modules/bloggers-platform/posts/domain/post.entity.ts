import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreatePostDto } from '../dto/create-post.dto';
import { CreatePostDomainDto } from './dto/create-post.domain-dto';
import { ExtendedLikesInfo } from './dto/extended-likes.schema';

export const postTitleConstraints = {
  minLength: 1,
  maxLength: 30,
};

export const postDescriptionConstraints = {
  minLength: 1,
  maxLength: 100,
};
export const postContentConstraints = {
  minLength: 1,
  maxLength: 1000,
};

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: String, require: true, ...postTitleConstraints })
  title: string;

  @Prop({ type: String, require: true, ...postDescriptionConstraints })
  shortDescription: string;

  @Prop({ type: String, require: true, ...postContentConstraints })
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
