import { BaseQueryParams } from '../../../../../core/dto/base-query-params.input-dto';
import { UsersSortBy } from './users-sort-by';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class GetUsersQueryInputDto extends BaseQueryParams {
  @IsEnum(UsersSortBy)
  sortBy = UsersSortBy.CreatedAt;

  @IsString()
  @IsOptional()
  searchLoginTerm: string | null = null;

  @IsString()
  @IsOptional()
  searchEmailTerm: string | null = null;
}

export const sortByUsersQueryAdapter = {
  createdAt: 'created_at',
  login: 'login',
  email: 'email',
};
