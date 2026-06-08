import { IsString, Length } from 'class-validator';
import { commentContentConstraints } from '../../domain/comment.entity';
import { Trim } from '../../../../../core/decorators/transform/trim';

export class CreateCommentByPostInputDto {
  @IsString()
  @Length(
    commentContentConstraints.minLength,
    commentContentConstraints.maxLength,
  )
  @Trim()
  content: string;
}
