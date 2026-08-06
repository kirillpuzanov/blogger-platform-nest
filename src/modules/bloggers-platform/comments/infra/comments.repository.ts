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
