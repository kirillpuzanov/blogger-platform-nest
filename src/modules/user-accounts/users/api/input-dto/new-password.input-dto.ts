import { NewPasswordDto } from '../../dto/new-password.dto';
import { IsString, Length } from 'class-validator';
import { passwordConstraints } from '../../domain/user.entity';
import { Trim } from '../../../../../core/decorators/transform/trim';

export class NewPasswordInputDto implements NewPasswordDto {
  @IsString()
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  @Trim()
  newPassword: string;

  @IsString()
  recoveryCode: string;
}
