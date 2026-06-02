import { CreateUserDto } from '../../dto/create-user.dto';
import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';
import {
  emailConstraints,
  loginConstraints,
  passwordConstraints,
} from '../../domain/user.entity';
import { Trim } from '../../../../../core/decorators/transform/trim';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserInputDto implements CreateUserDto {
  @ApiProperty({ minLength: 3, maxLength: 30 })
  @IsString()
  @IsStringWithTrim(loginConstraints.minLength, loginConstraints.maxLength)
  login: string;

  @IsString()
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  @Trim()
  password: string;

  @ApiProperty({ pattern: emailConstraints.match })
  @IsString()
  @Matches(emailConstraints.match)
  @IsEmail()
  @Trim()
  email: string;
}
