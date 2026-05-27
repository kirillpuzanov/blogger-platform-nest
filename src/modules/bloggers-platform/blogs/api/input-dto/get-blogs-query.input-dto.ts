import { BaseQueryParams } from '../../../../../core/dto/base-query-params.input-dto';
import { BlogsSortBy } from './blogs-sort-by';

export class GetBlogsQueryInputDto extends BaseQueryParams {
  sortBy = BlogsSortBy.createdAt;
  searchNameTerm: string | null = null;
}
