import { IsString } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transform/trim';
import { RegistrationConfirmDto } from '../../dto/registration.dto';

export class RegistrationConfirmInputDto implements RegistrationConfirmDto {
  @IsString()
  @Trim()
  code: string;
}
