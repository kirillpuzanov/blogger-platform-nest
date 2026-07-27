import { BaseQueryParams } from '../../../../../core/dto/base-query-params.input-dto';
import { BlogsSortBy } from './blogs-sort-by';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class GetBlogsQueryInputDto extends BaseQueryParams {
  @IsEnum(BlogsSortBy)
  sortBy: BlogsSortBy = BlogsSortBy.CreatedAt;

  @IsString()
  @IsOptional()
  searchNameTerm?: string | null = null;
}

export const sortByBlogsQueryAdapter = {
  createdAt: 'created_at',
  name: 'name',
};
