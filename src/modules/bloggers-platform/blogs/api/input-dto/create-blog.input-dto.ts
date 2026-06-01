import { CreateBlogDto, CreatePostByBlogDto } from '../../dto/create-blog.dto';
import { IsString, IsUrl, Matches } from 'class-validator';
import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';
import {
  blogDescriptionConstraints,
  blogNameConstraints,
  blogWebUrlConstraints,
} from '../../domain/blog.entity';
import {
  postContentConstraints,
  postDescriptionConstraints,
  postTitleConstraints,
} from '../../../posts/domain/post.entity';

export class CreateBlogInputDto implements CreateBlogDto {
  @IsString()
  @IsStringWithTrim(
    blogNameConstraints.minLength,
    blogNameConstraints.maxLength,
  )
  name: string;

  @IsString()
  @IsStringWithTrim(
    blogDescriptionConstraints.minLength,
    blogDescriptionConstraints.maxLength,
  )
  description: string;

  @IsString()
  @Matches(blogWebUrlConstraints.match)
  @IsUrl()
  @IsStringWithTrim(
    blogWebUrlConstraints.minLength,
    blogWebUrlConstraints.maxLength,
  )
  websiteUrl: string;
}

export class CreatePostByBlogInputDto implements CreatePostByBlogDto {
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
