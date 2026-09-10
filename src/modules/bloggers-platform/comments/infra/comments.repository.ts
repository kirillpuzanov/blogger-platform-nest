import { Injectable } from '@nestjs/common';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain.exception';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentTypeOrm } from '../domain/comment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(CommentTypeOrm)
    private commentsRepo: Repository<CommentTypeOrm>,
  ) {}

  async save(comment: CommentTypeOrm) {
    const result = await this.commentsRepo.save<CommentTypeOrm>(comment);
    return result.id;
  }

  async findByIdOrFail(id: string): Promise<CommentTypeOrm> {
    const comment = await this.commentsRepo.findOneBy({ id: id });

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'comment not found',
      });
    }
    return comment;
  }

  async deleteOne(commentId: string): Promise<void> {
    const result = await this.commentsRepo.delete({ id: commentId });

    if (!result.affected) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'comment not found',
      });
    }
  }
}

//Row Sql
// @Injectable()
// export class CommentsRepository {
//   constructor(@InjectDataSource() protected dataSource: DataSource) {}
//
//   async createComment(comment: CommentSqlDto) {
//     const {
//       blog_id,
//       post_id,
//       content,
//       user_id,
//       user_login,
//       likes_count,
//       dislikes_count,
//     } = comment;
//     const result = await this.dataSource.query<[{ id: string }]>(
//       `
//       INSERT INTO comments (
//         blog_id,
//         post_id,
//         content,
//         user_id,
//         user_login,
//         likes_count,
//         dislikes_count
//        )
//       VALUES ($1, $2,$3, $4, $5, $6, $7)
//       RETURNING id
//     `,
//       [
//         blog_id,
//         post_id,
//         content,
//         user_id,
//         user_login,
//         likes_count,
//         dislikes_count,
//       ],
//     );
//
//     return result[0].id;
//   }
//
//   async updateComment(content: string, commentId: string): Promise<void> {
//     return this.dataSource.query<void>(
//       `
//         UPDATE comments
//         SET content=$1
//         WHERE id = $2
//         `,
//       [content, commentId],
//     );
//   }
//
//   async updateLikeCount(
//     commentId: string,
//     likeCountDelta: number,
//     dislikeCountDelta: number,
//   ): Promise<void> {
//     return this.dataSource.query<void>(
//       `
//         UPDATE comments
//         SET likes_count = likes_count + $1, dislikes_count = dislikes_count + $2
//         WHERE id = $3
//         `,
//       [likeCountDelta, dislikeCountDelta, commentId],
//     );
//   }
//
//   async findByIdOrFail(id: string): Promise<CommentSqlDto> {
//     const result = await this.dataSource.query<CommentSqlDto[]>(
//       `SELECT * FROM comments WHERE id=$1`,
//       [id],
//     );
//     const comment = result[0];
//
//     if (!comment) {
//       throw new DomainException({
//         code: DomainExceptionCode.NotFound,
//         message: 'comment not found',
//       });
//     }
//     return comment;
//   }
//
//   async deleteOne(commentId: string): Promise<void> {
//     const result = await this.dataSource.query<number[]>(
//       `
//       DELETE FROM comments
//       WHERE id=$1`,
//       [commentId],
//     );
//
//     if (result[1] < 1) {
//       throw new DomainException({
//         code: DomainExceptionCode.NotFound,
//         message: 'comment not found',
//       });
//     }
//   }
//
//   async deleteMany(parentId: string): Promise<void> {
//     await this.dataSource.query<QueryResult>(
//       `
//         DELETE from posts
//         WHERE blog_id=$1
//     `,
//       [parentId],
//     );
//   }
// }
