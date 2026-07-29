import { Injectable } from '@nestjs/common';
import {
  GetBlogsQueryInputDto,
  sortByBlogsQueryAdapter,
} from '../api/input-dto/get-blogs-query.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base-paginated.view-dto';
import { BlogViewDto } from '../api/view-dto/blog.view-dto';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain.exception';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogSqlDto } from '../domain/dto/blog.sql-dto';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getAll(
    query: GetBlogsQueryInputDto,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const { pageNumber, pageSize, sortBy, sortDirection, searchNameTerm } =
      query;

    const conditions: string[] = [];
    const parameters: string[] = [];
    let paramIndex = 1;

    if (searchNameTerm) {
      conditions.push(`name ILIKE $${paramIndex}`);
      parameters.push(`%${searchNameTerm}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions[0]}` : '';

    const offset = query.calculateSkip();

    const sortByExpression =
      sortByBlogsQueryAdapter[sortBy] === 'created_at'
        ? sortByBlogsQueryAdapter[sortBy]
        : `${sortByBlogsQueryAdapter[sortBy]} COLLATE "C"`;

    const queryText = `
    SELECT * FROM blogs
    ${whereClause} 
    ORDER BY ${sortByExpression} ${sortDirection}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

    const blogs = await this.dataSource.query<BlogSqlDto[]>(queryText, [
      ...parameters,
      pageSize,
      offset,
    ]);

    const countQueryText = `
    SELECT COUNT(*) as total FROM blogs
    ${whereClause}
  `;

    const countResult = await this.dataSource.query<[{ total: string }]>(
      countQueryText,
      parameters,
    );

    const totalCount = Number(countResult[0]?.total || 0);

    const blogsView = blogs.map((user) => BlogViewDto.mapToViewSql(user));

    return PaginatedViewDto.mapToView({
      page: pageNumber,
      totalCount,
      items: blogsView,
      size: pageSize,
    });
  }

  async getByIdOrFail(id: string): Promise<BlogViewDto> {
    const blogs = await this.dataSource.query<BlogSqlDto[]>(
      `SELECT * FROM blogs WHERE "id"=$1`,
      [id],
    );

    const blog = blogs[0];

    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'blog for create post not found',
      });
    }

    return BlogViewDto.mapToViewSql(blog);
  }
}

// Mongoose
// @Injectable()
// export class BlogsQueryRepository {
//   constructor(@InjectModel(Blog.modelName) private BlogModel: BlogModelType) {}
//
//   async getAll(
//     query: GetBlogsQueryInputDto,
//   ): Promise<PaginatedViewDto<BlogViewDto[]>> {
//     const { pageNumber, pageSize, sortBy, sortDirection, searchNameTerm } =
//       query;
//
//     const filter: Record<string, object> = {};
//
//     if (searchNameTerm) {
//       filter.name = { $regex: searchNameTerm, $options: 'i' };
//     }
//
//     const blogs = await this.BlogModel.find(filter)
//       .sort({ [sortBy]: sortDirection })
//       .skip(query.calculateSkip())
//       .limit(pageSize)
//       .lean();
//
//     const totalCount = await this.BlogModel.countDocuments(filter);
//
//     const blogsView = blogs.map((el) => BlogViewDto.mapToView(el));
//
//     return PaginatedViewDto.mapToView({
//       page: pageNumber,
//       totalCount,
//       items: blogsView,
//       size: pageSize,
//     });
//   }
//
//   async getByIdOrFail(id: string): Promise<BlogViewDto> {
//     const blog = await this.BlogModel.findOne({ _id: new ObjectId(id) });
//
//     if (!blog) {
//       throw new DomainException({
//         code: DomainExceptionCode.NotFound,
//         message: 'blog for create post not found',
//       });
//     }
//
//     return BlogViewDto.mapToView(blog);
//   }
// }
