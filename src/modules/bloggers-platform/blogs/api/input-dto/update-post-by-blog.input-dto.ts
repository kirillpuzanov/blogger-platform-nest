import { CreatePostByBlogDto } from '../../dto/create-blog.dto';
import { IsString } from 'class-validator';
import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';
import {
  postContentConstraints,
  postDescriptionConstraints,
  postTitleConstraints,
} from '../../../posts/domain/post.entity';

export class UpdatePostByBlogInputDto implements CreatePostByBlogDto {
  @IsString()
  @IsStringWithTrim(
    postTitleConstraints.minLength,
    postTitleConstraints.maxLength,
  )
  title: string;

  @IsString()
  @IsStringWithTrim(
    postDescriptionConstraints.minLength,
    postDescriptionConstraints.maxLength,
  )
  shortDescription: string;

  @IsString()
  @IsStringWithTrim(
    postContentConstraints.minLength,
    postContentConstraints.maxLength,
  )
  content: string;
}
