import { Injectable } from '@nestjs/common';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain.exception';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { QueryResult } from 'pg';
import { PostSqlDto } from '../domain/dto/post.sql-dto';
import { UpdatePostSqlDomainDto } from '../domain/dto/update-post.domain-dto';

@Injectable()
export class PostsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createPost(post: PostSqlDto) {
    const {
      title,
      short_description,
      content,
      blog_id,
      blog_name,
      likes_count,
      dislikes_count,
    } = post;
    const result = await this.dataSource.query<[{ id: string }]>(
      `
      INSERT INTO posts (
        title,
        short_description,
        content,
        blog_id,
        blog_name,
        likes_count,
        dislikes_count
       )
      VALUES ($1, $2,$3, $4, $5, $6, $7)
      RETURNING id
    `,
      [
        title,
        short_description,
        content,
        blog_id,
        blog_name,
        likes_count,
        dislikes_count,
      ],
    );

    return result[0].id;
  }

  async updatePost(
    post: UpdatePostSqlDomainDto,
    postId: string,
  ): Promise<void> {
    const { title, content, short_description } = post;
    return this.dataSource.query<void>(
      `
        UPDATE posts
        SET title=$1, content=$2, short_description=$3
        WHERE id = $4
        `,
      [title, content, short_description, postId],
    );
  }

  async findByIdOrFail(id: string): Promise<PostSqlDto> {
    const result = await this.dataSource.query<PostSqlDto[]>(
      `SELECT * FROM posts WHERE id=$1`,
      [id],
    );
    const post = result[0];

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'post not found',
      });
    }
    return post;
  }

  async deleteById(id: string): Promise<void> {
    await this.dataSource.query<number[]>(
      `
      DELETE FROM posts
      WHERE id=$1`,
      [id],
    );
  }

  async deleteMany(id: string): Promise<void> {
    await this.dataSource.query<QueryResult>(
      `
    DELETE from posts
    WHERE blog_id=$1
    `,
      [id],
    );
  }

  async updateBlogName(blogId: string, blogName: string): Promise<void> {
    return this.dataSource.query<void>(
      `
        UPDATE posts
        SET blog_name=$1
        WHERE blog_id=$2
        `,
      [blogName, blogId],
    );
  }

  async updateLikeCount(
    likesCountDelta: number,
    dislikesCountDelta: number,
    postId: string,
  ): Promise<void> {
    return this.dataSource.query<void>(
      `
        UPDATE posts
        SET likes_count = likes_count + $1, dislikes_count = dislikes_count + $2
        WHERE id = $3
        `,
      [likesCountDelta, dislikesCountDelta, postId],
    );
  }
}
