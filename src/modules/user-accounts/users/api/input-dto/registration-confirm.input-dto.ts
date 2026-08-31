import { IsString } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transform/trim';

export class RegistrationConfirmDto {
  code: string;
}

export class RegistrationConfirmInputDto implements RegistrationConfirmDto {
  @IsString()
  @Trim()
  code: string;
}
