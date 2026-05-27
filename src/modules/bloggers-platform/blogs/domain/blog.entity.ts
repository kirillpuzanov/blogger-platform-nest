import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { HydratedDocument, Model } from 'mongoose';

@Schema({ timestamps: true })
export class Blog {
  @Prop({ type: String, require: true })
  name: string;

  @Prop({ type: String, require: true })
  description: string;

  @Prop({ type: String, require: true })
  websiteUrl: string;

  @Prop({ type: Date, require: true })
  createdAt: Date;

  @Prop({ type: Boolean, require: false, default: true })
  isMembership: boolean;

  static modelName = 'BlogModel';
  static collectionName = 'blogs';

  static createBlog(dto: CreateBlogDto): BlogDocument {
    const blog = new this();

    dto.name = blog.name;
    dto.description = blog.description;
    dto.websiteUrl = blog.websiteUrl;

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
