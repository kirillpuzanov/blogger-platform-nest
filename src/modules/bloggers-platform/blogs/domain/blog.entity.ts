import { CreateBlogDto } from '../dto/create-blog.dto';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

class BlogSqlDto {
  id: string;
  name: string;
  description: string;
  website_url: string;
  created_at: Date;
  is_membership: boolean;
}

@Entity('blogs')
export class BlogTypeOrm implements BlogSqlDto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false, length: '15' })
  name: string;

  @Column({ type: 'text', nullable: false, length: '500' })
  description: string;

  @Column({ type: 'varchar', nullable: false })
  website_url: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'boolean', nullable: false, default: false })
  is_membership: boolean;

  static createBlog(dto: CreateBlogDto): BlogTypeOrm {
    const blog = new this();

    blog.name = dto.name;
    blog.description = dto.description;
    blog.website_url = dto.websiteUrl;

    return blog;
  }

  updateBlog(dto: CreateBlogDto) {
    this.name = dto.name;
    this.description = dto.description;
    this.website_url = dto.websiteUrl;
  }
}

export class BlogSql implements BlogSqlDto {
  id: string;
  name: string;
  description: string;
  website_url: string;
  created_at: Date;
  is_membership: boolean;

  static createBlog(dto: CreateBlogDto): BlogSqlDto {
    const blog = new this();
    blog.name = dto.name;
    blog.description = dto.description;
    blog.website_url = dto.websiteUrl;
    blog.is_membership = false;
    return blog;
  }
}

// mongoose
//
// @Schema({ timestamps: true })
// export class Blog {
//   @Prop({ type: String, require: true, ...blogNameConstraints })
//   name: string;
//
//   @Prop({ type: String, require: true, ...blogDescriptionConstraints })
//   description: string;
//
//   @Prop({ type: String, require: true, ...blogWebUrlConstraints })
//   websiteUrl: string;
//
//   @Prop({ type: Date, require: true })
//   createdAt: Date;
//
//   @Prop({ type: Boolean, require: false, default: false })
//   isMembership: boolean;
//
//   static modelName = 'BlogModel';
//   static collectionName = 'blogs';
//
//   static createBlog(dto: CreateBlogDto): BlogDocument {
//     const blog = new this();
//
//     blog.name = dto.name;
//     blog.description = dto.description;
//     blog.websiteUrl = dto.websiteUrl;
//
//     return blog as BlogDocument;
//   }
//
//   updateBlog(dto: CreateBlogDto) {
//     this.name = dto.name;
//     this.description = dto.description;
//     this.websiteUrl = dto.websiteUrl;
//   }
// }
//
// export const BlogSchema = SchemaFactory.createForClass(Blog);
// //регистрирует методы сущности в схеме
// BlogSchema.loadClass(Blog);
//
// //Типизация документа
// export type BlogDocument = HydratedDocument<Blog>;
//
// //Типизация модели + статические методы
// export type BlogModelType = Model<BlogDocument> & typeof Blog;
