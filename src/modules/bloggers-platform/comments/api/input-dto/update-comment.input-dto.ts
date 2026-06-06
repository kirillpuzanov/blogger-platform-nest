import { IsString, Length } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transform/trim';
import { UpdateCommentDto } from '../../dto/update-comment.dto';
import { commentContentConstraints } from '../../domain/comment.entity';

export class UpdateCommentInputDto implements UpdateCommentDto {
  @IsString()
  @Length(
    commentContentConstraints.minLength,
    commentContentConstraints.maxLength,
  )
  @Trim()
  content: string;
}
