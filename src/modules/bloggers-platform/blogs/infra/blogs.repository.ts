import { Injectable } from '@nestjs/common';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain.exception';
import { BlogSqlDto } from '../domain/dto/blog.sql-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createBlog(blog: BlogSqlDto) {
    const { name, description, website_url, is_membership } = blog;
    const result = await this.dataSource.query<[{ id: string }]>(
      `
      INSERT INTO blogs (name, description, website_url, is_membership)
      VALUES ($1, $2,$3, $4)
      RETURNING id
    `,
      [name, description, website_url, is_membership],
    );

    return result[0].id;
  }

  async updateBlog(blog: BlogSqlDto, blogId: string): Promise<void> {
    const { name, description, website_url } = blog;
    return this.dataSource.query<void>(
      `
        UPDATE blogs
        SET name=$1, description=$2, website_url=$3
        WHERE id = $4
        `,
      [name, description, website_url, blogId],
    );
  }

  async deleteById(id: string): Promise<void> {
    const result = await this.dataSource.query<number[]>(
      `
      DELETE FROM blogs
      WHERE id=$1`,
      [id],
    );

    if (result[1] < 1) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'blog not found',
      });
    }
  }

  async findByIdOrFail(id: string): Promise<BlogSqlDto> {
    const result = await this.dataSource.query<BlogSqlDto[]>(
      `SELECT * FROM blogs WHERE id=$1`,
      [id],
    );
    const blog = result[0];

    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'blog not found',
      });
    }
    return blog;
  }
}
