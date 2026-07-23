import { Injectable } from '@nestjs/common';
import { UserViewDto } from '../api/view-dto/user.view-dto';
import {
  GetUsersQueryInputDto,
  sortByUsersQueryAdapter,
} from '../api/input-dto/get-users-query.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base-paginated.view-dto';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain.exception';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { UserSqlDto } from '../domain/sql-entity-dto/user.sql-dto';

@Injectable()
export class UsersSqlQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getAll(
    query: GetUsersQueryInputDto,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      searchLoginTerm,
      searchEmailTerm,
    } = query;

    const conditions: string[] = [];
    const parameters: string[] = [];
    let paramIndex = 1;

    if (searchLoginTerm) {
      conditions.push(`login ILIKE $${paramIndex}`);
      parameters.push(`%${searchLoginTerm}%`);
      paramIndex++;
    }

    if (searchEmailTerm) {
      conditions.push(`email ILIKE $${paramIndex}`);
      parameters.push(`%${searchEmailTerm}%`);
      paramIndex++;
    }

    /**  Если есть условия → добавляем WHERE, если нет → пустая строка */
    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' OR ')}` : '';

    const offset = query.calculateSkip();

    const queryText = `
    SELECT * FROM public.users
    ${whereClause}
    ORDER BY ${sortByUsersQueryAdapter[sortBy]} ${sortDirection}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

    /** Массив параметров: [условия поиска..., pageSize, offset] */
    const users = await this.dataSource.query<UserSqlDto[]>(queryText, [
      ...parameters,
      pageSize,
      offset,
    ]);

    const countQuery = `
    SELECT COUNT(*) as total FROM public.users
    ${whereClause}
  `;

    const countResult = await this.dataSource.query<[{ total: string }]>(
      countQuery,
      parameters,
    );

    const totalCount = Number(countResult[0]?.total || 0);

    const usersView = users.map((user) => UserViewDto.mapToViewSql(user));

    return PaginatedViewDto.mapToView({
      page: pageNumber,
      totalCount,
      items: usersView,
      size: pageSize,
    });
  }

  async getByIdOrFail(id: string): Promise<UserViewDto> {
    const users = await this.dataSource.query<UserSqlDto[]>(
      `SELECT * FROM public.users WHERE "id" = $1`,
      [id],
    );

    const user = users[0];

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'user not found',
      });
    }

    return UserViewDto.mapToViewSql(user);
  }
}

// - как при создании например юзера заполнять разные зависимые таблицы

// WITH new_user AS (
//   INSERT INTO users (name, email)
// VALUES ('John Doe', 'john@mail.com')
// RETURNING id
// )
// INSERT INTO posts (title, content, user_id)
// SELECT 'First Post', 'Content...', id
// FROM new_user
// UNION ALL
// SELECT 'Second Post', 'Content...', id
// FROM new_user;
