import { IsEmail, IsString, Matches } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transform/trim';
import { ApiProperty } from '@nestjs/swagger';
import { emailConstraints } from '../../domain/user.entity';

export class RegistrationResendCodeDto {
  email: string;
}

export class RegistrationResendCodeInputDto implements RegistrationResendCodeDto {
  @ApiProperty({ pattern: emailConstraints.match })
  @IsString()
  @Matches(emailConstraints.match)
  @IsEmail()
  @Trim()
  email: string;
}
