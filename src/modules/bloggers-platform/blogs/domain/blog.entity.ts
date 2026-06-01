import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { HydratedDocument, Model } from 'mongoose';

export const blogNameConstraints = {
  minLength: 1,
  maxLength: 15,
};

export const blogDescriptionConstraints = {
  minLength: 1,
  maxLength: 500,
};

export const blogWebUrlConstraints = {
  match: /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
  minLength: 1,
  maxLength: 100,
};

@Schema({ timestamps: true })
export class Blog {
  @Prop({ type: String, require: true, ...blogNameConstraints })
  name: string;

  @Prop({ type: String, require: true, ...blogDescriptionConstraints })
  description: string;

  @Prop({ type: String, require: true, ...blogWebUrlConstraints })
  websiteUrl: string;

  @Prop({ type: Date, require: true })
  createdAt: Date;

  @Prop({ type: Boolean, require: false, default: false })
  isMembership: boolean;

  static modelName = 'BlogModel';
  static collectionName = 'blogs';

  static createBlog(dto: CreateBlogDto): BlogDocument {
    const blog = new this();

    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;

    return blog as BlogDocument;
  }

  updateBlog(dto: CreateBlogDto) {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
//регистрирует методы сущности в схеме
BlogSchema.loadClass(Blog);

//Типизация документа
export type BlogDocument = HydratedDocument<Blog>;

//Типизация модели + статические методы
export type BlogModelType = Model<BlogDocument> & typeof Blog;
