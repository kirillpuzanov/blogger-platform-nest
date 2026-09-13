import { LikeStatus } from '../../../../core/dto/like-status';
import { CreateLikeDto } from './create-like.dto';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserTypeOrm } from '../../../user-accounts/users/domain/user.entity';

export class LikeSqlDto {
  id: string;
  parent_id: string;
  user_id: string;
  user_login: string;
  status: LikeStatus;
  created_at: Date;
}

@Entity('likes')
export class LikeTypeOrm implements LikeSqlDto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  parent_id: string;

  @ManyToOne(() => UserTypeOrm, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserTypeOrm;

  @Column({ type: 'uuid', nullable: false })
  user_id: string;

  @Column({ type: 'varchar', nullable: false, length: 50 })
  user_login: string;

  @Column({ type: 'varchar', nullable: false, length: 20 })
  status: LikeStatus;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  static createLike(dto: CreateLikeDto): LikeTypeOrm {
    const like = new this();
    like.parent_id = dto.parentId;
    like.user_id = dto.userId;
    like.user_login = dto.userLogin;
    like.status = dto.status;

    return like;
  }

  updateLikeStatus(status: LikeStatus): LikeTypeOrm {
    this.status = status;

    if (status !== LikeStatus.None) {
      this.created_at = new Date(); // todo -- ??
    }
    return this;
  }
}

// Mongoose

// @Schema({ _id: false })
// export class LikeAuthor {
//   @Prop({ type: String, require: true })
//   userId: string;
//
//   @Prop({ type: String, require: true })
//   userLogin: string;
// }
//
// @Schema({ timestamps: true })
// export class Like {
//   @Prop({ type: String, require: true })
//   parentId: string;
//
//   @Prop({ type: Date, require: true })
//   createdAt: Date;
//
//   @Prop({
//     type: String,
//     enum: Object.values(LikeStatus),
//     require: true,
//     default: LikeStatus.None,
//   })
//   status: LikeStatus;
//
//   @Prop({ type: LikeAuthor, require: true })
//   author: LikeAuthor;
//
//   static modelName = 'LikeModel';
//   static collectionName = 'likes';
//
//   static createLike(dto: CreateLikeDto) {
//     const like = new this();
//     like.parentId = dto.parentId;
//     like.status = dto.status;
//     like.createdAt = new Date();
//     like.author = {
//       userId: dto.userId,
//       userLogin: dto.userLogin,
//     };
//
//     return like as LikeDocument;
//   }
//
//   updateLikeStatus(status: LikeStatus) {
//     this.status = status;
//
//     if (status !== LikeStatus.None) {
//       this.createdAt = new Date();
//     }
//   }
// }
//
// export const LikeSchema = SchemaFactory.createForClass(Like);
// //регистрирует методы сущности в схеме
// LikeSchema.loadClass(Like);
//
// //Типизация документа
// export type LikeDocument = HydratedDocument<Like>;
//
// //Типизация модели + статические методы
// export type LikeModelType = Model<LikeDocument> & typeof Like;
