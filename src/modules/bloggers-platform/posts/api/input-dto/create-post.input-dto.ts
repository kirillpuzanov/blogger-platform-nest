import { CreatePostDto } from '../../dto/create-post.dto';
import { IsMongoId, IsString } from 'class-validator';
import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';
import {
  postContentConstraints,
  postDescriptionConstraints,
  postTitleConstraints,
} from '../../domain/post.entity';

export class CreatePostInputDto implements CreatePostDto {
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

  @IsMongoId()
  blogId: string;
}
