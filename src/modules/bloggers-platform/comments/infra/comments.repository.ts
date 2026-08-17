import { Injectable } from '@nestjs/common';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain.exception';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentSqlDto } from '../domain/comment.sql-dto';
import { QueryResult } from 'pg';

@Injectable()
export class CommentsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createComment(comment: CommentSqlDto) {
    const {
      blog_id,
      post_id,
      content,
      user_id,
      user_login,
      likes_count,
      dislikes_count,
    } = comment;
    const result = await this.dataSource.query<[{ id: string }]>(
      `
      INSERT INTO comments (
        blog_id,
        post_id,
        content,
        user_id,
        user_login,
        likes_count,
        dislikes_count
       )
      VALUES ($1, $2,$3, $4, $5, $6, $7)
      RETURNING id
    `,
      [
        blog_id,
        post_id,
        content,
        user_id,
        user_login,
        likes_count,
        dislikes_count,
      ],
    );

    return result[0].id;
  }

  async updateComment(content: string, commentId: string): Promise<void> {
    return this.dataSource.query<void>(
      `
        UPDATE comments
        SET content=$1
        WHERE id = $2
        `,
      [content, commentId],
    );
  }

  async updateLikeCount(
    commentId: string,
    likeCount: number,
    dislikeCount: number,
  ): Promise<void> {
    return this.dataSource.query<void>(
      `
        UPDATE comments
        SET likes_count=$1, dislikes_count=$2
        WHERE id = $3
        `,
      [likeCount, dislikeCount, commentId],
    );
  }

  async findByIdOrFail(id: string): Promise<CommentSqlDto> {
    const result = await this.dataSource.query<CommentSqlDto[]>(
      `SELECT * FROM comments WHERE id=$1`,
      [id],
    );
    const comment = result[0];

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'comment not found',
      });
    }
    return comment;
  }

  async deleteOne(commentId: string): Promise<void> {
    const result = await this.dataSource.query<number[]>(
      `
      DELETE FROM comments
      WHERE id=$1`,
      [commentId],
    );

    if (result[1] < 1) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'comment not found',
      });
    }
  }

  async deleteMany(parentId: string): Promise<void> {
    await this.dataSource.query<QueryResult>(
      `
        DELETE from posts
        WHERE blog_id=$1
    `,
      [parentId],
    );
  }
}
