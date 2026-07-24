import { Injectable } from '@nestjs/common';
import { UserViewDto } from '../api/view-dto/user.view-dto';
import {
  GetUsersQueryInputDto,
  sortByUsersQueryAdapter,
  sortDirectionAdapter,
} from '../api/input-dto/get-users-query.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base-paginated.view-dto';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain.exception';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserSqlDto } from '../domain/sql-entity-dto/user.sql-dto';

@Injectable()
export class UsersQueryRepository {
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

    const sortByExpression =
      sortByUsersQueryAdapter[sortBy] === 'created_at'
        ? sortByUsersQueryAdapter[sortBy]
        : `${sortByUsersQueryAdapter[sortBy]} COLLATE "C"`;

    const queryText = `
    SELECT * FROM public.users
    ${whereClause} 
    ORDER BY ${sortByExpression} ${sortDirectionAdapter[sortDirection]}
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

//Mongoose

// @Injectable()
// export class UsersQueryRepository {
//   constructor(@InjectModel(User.modelName) private UserModel: UserModelType) {}
//
//   async getAll(
//     query: GetUsersQueryInputDto,
//   ): Promise<PaginatedViewDto<UserViewDto[]>> {
//     const {
//       pageNumber,
//       pageSize,
//       sortBy,
//       sortDirection,
//       searchLoginTerm,
//       searchEmailTerm,
//     } = query;
//
//     let filter = {};
//     const searchedFields: Array<object> = [];
//
//     if (searchLoginTerm) {
//       searchedFields.push({
//         login: { $regex: searchLoginTerm, $options: 'i' },
//       });
//     }
//     if (searchEmailTerm) {
//       searchedFields.push({
//         email: { $regex: searchEmailTerm, $options: 'i' },
//       });
//     }
//
//     if (searchedFields.length) {
//       filter = { $or: searchedFields };
//     }
//     const users = await this.UserModel.find(filter)
//       .sort({ [sortBy]: sortDirection })
//       .skip(query.calculateSkip())
//       .limit(pageSize)
//       .lean();
//
//     const totalCount = await this.UserModel.countDocuments(filter);
//
//     const usersView = users.map((user) => UserViewDto.mapToView(user));
//
//     return PaginatedViewDto.mapToView({
//       page: pageNumber,
//       totalCount,
//       items: usersView,
//       size: pageSize,
//     });
//   }
//
//   async getByIdOrFail(id: string): Promise<UserViewDto> {
//     const user = await this.UserModel.findOne({ _id: new ObjectId(id) });
//
//     if (!user) {
//       throw new DomainException({
//         code: DomainExceptionCode.NotFound,
//         message: 'user not found',
//       });
//     }
//
//     return UserViewDto.mapToView(user);
//   }
// }
