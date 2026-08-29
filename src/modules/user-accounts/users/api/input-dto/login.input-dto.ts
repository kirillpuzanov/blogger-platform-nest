import { IsString, Length } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transform/trim';
import { passwordConstraints } from '../../domain/user.entity';

export class LoginDto {
  loginOrEmail: string;
  password: string;
}

export class LoginInputDto implements LoginDto {
  @IsString()
  loginOrEmail: string;

  @IsString()
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  @Trim()
  password: string;
}
