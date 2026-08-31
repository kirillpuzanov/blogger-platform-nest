import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transform/trim';
import {
  emailConstraints,
  loginConstraints,
  passwordConstraints,
} from '../../domain/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class RegistrationDto {
  login: string;
  password: string;
  email: string;
}

export class RegistrationInputDto implements RegistrationDto {
  @IsString()
  @Length(loginConstraints.minLength, loginConstraints.maxLength)
  @Matches(loginConstraints.match)
  @Trim()
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
