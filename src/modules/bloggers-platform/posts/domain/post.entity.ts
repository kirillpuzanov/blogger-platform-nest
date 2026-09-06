import { CreatePostSqlDomainDto } from './dto/create-post.domain-dto';
import { PostSqlDto } from './dto/post.sql-dto';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BlogTypeOrm } from '../../blogs/domain/blog.entity';
import { UpdatePostSqlDomainDto } from './dto/update-post.domain-dto';

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

@Entity('posts')
export class PostTypeOrm implements PostSqlDto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false, length: 30 })
  title: string;

  @Column({ type: 'varchar', nullable: false, length: 100 })
  short_description: string;

  @Column({ type: 'varchar', nullable: false, length: 1000 })
  content: string;

  @ManyToOne(() => BlogTypeOrm, (blog) => blog.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blog_id' })
  blog: BlogTypeOrm;

  @Column({ type: 'uuid' })
  blog_id: string;

  @Column({ type: 'varchar', nullable: false, length: 100 })
  blog_name: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'integer', nullable: false, default: 0 })
  likes_count: number;

  @Column({ type: 'integer', nullable: false, default: 0 })
  dislikes_count: number;

  static createPost(dto: CreatePostSqlDomainDto): PostTypeOrm {
    const post = new this();

    post.title = dto.title;
    post.short_description = dto.shortDescription;
    post.content = dto.content;
    post.blog_id = dto.blogId;
    post.blog_name = dto.blogName;
    post.likes_count = dto.likesCount;
    post.dislikes_count = dto.dislikesCount;

    return post;
  }

  updatePost(dto: UpdatePostSqlDomainDto) {
    this.title = dto.title;
    this.short_description = dto.short_description;
    this.content = dto.content;

    return this;
  }

  updateLikeCount(likesCount: number, dislikesCount: number) {
    this.likes_count = this.likes_count + likesCount;
    this.dislikes_count = this.dislikes_count + dislikesCount;

    return this;
  }
}

// export class PostSql implements PostSqlDto {
//   id: string;
//   title: string;
//   short_description: string;
//   content: string;
//   blog_id: string;
//   blog_name: string;
//   created_at: Date;
//   likes_count: number;
//   dislikes_count: number;
//
//   static createPost(dto: CreatePostSqlDomainDto): PostSqlDto {
//     const post = new this();
//
//     post.title = dto.title;
//     post.short_description = dto.shortDescription;
//     post.content = dto.content;
//     post.blog_id = dto.blogId;
//     post.blog_name = dto.blogName;
//     post.likes_count = dto.likesCount;
//     post.dislikes_count = dto.dislikesCount;
//
//     return post;
//   }
// }

//
// @Schema({ timestamps: true })
// export class Post {
//   @Prop({ type: String, require: true, ...postTitleConstraints })
//   title: string;
//
//   @Prop({ type: String, require: true, ...postDescriptionConstraints })
//   shortDescription: string;
//
//   @Prop({ type: String, require: true, ...postContentConstraints })
//   content: string;
//
//   @Prop({ type: String, require: true })
//   blogId: string;
//
//   @Prop({ type: String, require: true })
//   blogName: string;
//
//   @Prop({ type: Date, require: true })
//   createdAt: Date;
//
//   @Prop({ type: ExtendedLikesInfo, require: true })
//   extendedLikesInfo: ExtendedLikesInfo;
//
//   static modelName = 'PostModel';
//   static collectionName = 'posts';
//
//   static createPost(dto: CreatePostDomainDto): PostDocument {
//     const post = new this();
//
//     post.title = dto.title;
//     post.shortDescription = dto.shortDescription;
//     post.content = dto.content;
//     post.blogId = dto.blogId;
//     post.blogName = dto.blogName;
//     post.createdAt = dto.createdAt;
//     post.extendedLikesInfo = dto.extendedLikesInfo;
//
//     return post as PostDocument;
//   }
//
//   updatePost(dto: CreatePostDto) {
//     this.title = dto.title;
//     this.shortDescription = dto.shortDescription;
//     this.content = dto.content;
//     this.blogId = dto.blogId;
//   }
//
//   updateLikeCount(likesCount: number, dislikesCount: number) {
//     this.extendedLikesInfo.likesCount =
//       this.extendedLikesInfo.likesCount + likesCount;
//
//     this.extendedLikesInfo.dislikesCount =
//       this.extendedLikesInfo.dislikesCount + dislikesCount;
//   }
//
//   updateNewestLikes(newestLikes: NewestLikes[]) {
//     this.extendedLikesInfo.newestLikes = newestLikes;
//   }
// }
//
// export const PostSchema = SchemaFactory.createForClass(Post);
// //регистрирует методы сущности в схеме
// PostSchema.loadClass(Post);
//
// //Типизация документа
// export type PostDocument = HydratedDocument<Post>;
//
// //Типизация модели + статические методы
// export type PostModelType = Model<PostDocument> & typeof Post;
