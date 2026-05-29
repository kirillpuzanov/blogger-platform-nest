import { BaseQueryParams } from '../../../../../core/dto/base-query-params.input-dto';
import { PostsSortBy } from './posts-sort-by';

export class GetPostsQueryInputDto extends BaseQueryParams {
  sortBy = PostsSortBy.createdAt;
}
