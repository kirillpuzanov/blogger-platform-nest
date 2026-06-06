import { BaseQueryParams } from '../../../../../core/dto/base-query-params.input-dto';
import { IsEnum } from 'class-validator';
import { CommentsSortBy } from './comments-sort-by';

export class GetCommentsQueryInputDto extends BaseQueryParams {
  @IsEnum(CommentsSortBy)
  sortBy = CommentsSortBy.CreatedAt;
}
