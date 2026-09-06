import { Injectable } from '@nestjs/common';
import {
  GetBlogsQueryInputDto,
  sortByBlogsQueryAdapter,
} from '../api/input-dto/get-blogs-query.input-dto';
import {
  PaginatedViewDto,
  sortDirectionAdapter,
} from '../../../../core/dto/base-paginated.view-dto';
import { BlogViewDto } from '../api/view-dto/blog.view-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogTypeOrm } from '../domain/blog.entity';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain.exception';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectRepository(BlogTypeOrm)
    private blogsRepo: Repository<BlogTypeOrm>,
  ) {}

  async getAll(
    query: GetBlogsQueryInputDto,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const { pageNumber, pageSize, sortBy, sortDirection, searchNameTerm } =
      query;

    const qb = this.blogsRepo.createQueryBuilder('b');

    /** Для примера - ручная выборка через алиасы, из-за исползования getRawMany */
    qb.select([
      'id as "id"',
      'b.name as "name"',
      'b.description as "description"',
      'b.website_url as "website_url"',
      'b.created_at as "created_at"',
      'b.is_membership as "is_membership"',
    ]);

    if (searchNameTerm) {
      qb.where('name ILILE :searchNameTerm', { searchNameTerm });
    }

    const sortByExpression =
      sortByBlogsQueryAdapter[sortBy] === 'created_at'
        ? sortByBlogsQueryAdapter[sortBy]
        : `${sortByBlogsQueryAdapter[sortBy]} COLLATE "C"`;

    /** например: login COLLATE "C" ASC */
    qb.orderBy(sortByExpression, sortDirectionAdapter[sortDirection]);

    /** порция страницы */
    qb.take(pageSize);

    /** сколько пропускаем */
    qb.skip(query.calculateSkip());

    // аналог - вернет инстансы блогов и сразу количество
    // await qb.getManyAndCount();

    // выполняем запрос — один и тот же QueryBuilder для данных и для count
    const blogs = await qb.getRawMany();
    const totalCount = await qb.getCount();

    /** на самом деле blog не BlogTypeOrm, а POJO обьект - сырые дынные,
     *  из таблицы из за getRawMany метода */
    const blogsView = blogs.map((blog: BlogTypeOrm) =>
      BlogViewDto.mapToViewSql(blog),
    );

    return PaginatedViewDto.mapToView({
      page: pageNumber,
      totalCount,
      items: blogsView,
      size: pageSize,
    });
  }

  async getByIdOrFail(id: string): Promise<BlogViewDto> {
    const blog = await this.blogsRepo.findOneBy({ id: id });
    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'blog does not exists',
      });
    }

    return BlogViewDto.mapToViewSql(blog);
  }
}

// Row Sql

// @Injectable()
// export class BlogsQueryRepository {
//   constructor(@InjectDataSource() protected dataSource: DataSource) {}
//
//   async getAll(
//     query: GetBlogsQueryInputDto,
//   ): Promise<PaginatedViewDto<BlogViewDto[]>> {
//     const { pageNumber, pageSize, sortBy, sortDirection, searchNameTerm } =
//       query;
//
//     const conditions: string[] = [];
//     const parameters: string[] = [];
//     let paramIndex = 1;
//
//     if (searchNameTerm) {
//       conditions.push(`name ILIKE $${paramIndex}`);
//       parameters.push(`%${searchNameTerm}%`);
//       paramIndex++;
//     }
//
//     const whereClause = conditions.length > 0 ? `WHERE ${conditions[0]}` : '';
//
//     const offset = query.calculateSkip();
//
//     const sortByExpression =
//       sortByBlogsQueryAdapter[sortBy] === 'created_at'
//         ? sortByBlogsQueryAdapter[sortBy]
//         : `${sortByBlogsQueryAdapter[sortBy]} COLLATE "C"`;
//
//     const queryText = `
//     SELECT * FROM blogs
//     ${whereClause}
//     ORDER BY ${sortByExpression} ${sortDirection}
//     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
//   `;
//
//     const blogs = await this.dataSource.query<BlogTypeOrm[]>(queryText, [
//       ...parameters,
//       pageSize,
//       offset,
//     ]);
//
//     const countQueryText = `
//     SELECT COUNT(*) as total FROM blogs
//     ${whereClause}
//   `;
//
//     const countResult = await this.dataSource.query<[{ total: string }]>(
//       countQueryText,
//       parameters,
//     );
//
//     const totalCount = Number(countResult[0]?.total || 0);
//
//     const blogsView = blogs.map((user) => BlogViewDto.mapToViewSql(user));
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
//     const blogs = await this.dataSource.query<BlogTypeOrm[]>(
//       `SELECT * FROM blogs WHERE id=$1`,
//       [id],
//     );
//
//     const blog = blogs[0];
//
//     if (!blog) {
//       throw new DomainException({
//         code: DomainExceptionCode.NotFound,
//         message: 'blog for create post not found',
//       });
//     }
//
//     return BlogViewDto.mapToViewSql(blog);
//   }
// }

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
