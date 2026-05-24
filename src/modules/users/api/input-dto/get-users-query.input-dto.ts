import { BaseQueryParams } from '../../../../core/dto/base-query-params.input-dto';
import { UsersSortBy } from './users-sort-by';

export class GetUsersQueryInputDto extends BaseQueryParams {
  sortBy = UsersSortBy.createdAt;
  searchLoginTerm: string | null = null;
  searchEmailTerm: string | null = null;
}
