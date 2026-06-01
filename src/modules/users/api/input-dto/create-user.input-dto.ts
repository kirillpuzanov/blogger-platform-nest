import { CreateUserDto } from '../../dto/create-user.dto';
import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim';
import {
  emailConstraints,
  loginConstraints,
  passwordConstraints,
} from '../../domain/user.entity';
import { Trim } from '../../../../core/decorators/transform/trim';

export class CreateUserInputDto implements CreateUserDto {
  @IsString()
  @IsStringWithTrim(loginConstraints.minLength, loginConstraints.maxLength)
  login: string;

  @IsString()
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  @Trim()
  password: string;

  @IsString()
  @Matches(emailConstraints.match)
  @IsEmail()
  @Trim()
  email: string;
}
