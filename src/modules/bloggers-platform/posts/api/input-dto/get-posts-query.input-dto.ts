import { BaseQueryParams } from '../../../../../core/dto/base-query-params.input-dto';
import { PostsSortBy } from './posts-sort-by';
import { IsEnum } from 'class-validator';

export class GetPostsQueryInputDto extends BaseQueryParams {
  @IsEnum(PostsSortBy)
  sortBy = PostsSortBy.CreatedAt;
}

export const sortByPostsQueryAdapter = {
  createdAt: 'created_at',
  title: 'title',
  blogName: 'blog_name',
};
