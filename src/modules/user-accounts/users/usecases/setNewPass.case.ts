import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../infra/users.repository';
import { NewPasswordDto } from '../dto/new-password.dto';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain.exception';
import { CryptoService } from '../application/crypto.service';

export class SetNewPassCommand {
  constructor(public dto: NewPasswordDto) {}
}

@CommandHandler(SetNewPassCommand)
export class SetNewPassUseCase implements ICommandHandler<SetNewPassCommand> {
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
  ) {}

  async execute({ dto }: SetNewPassCommand): Promise<void> {
    const { recoveryCode, newPassword } = dto;
    const user = await this.usersRepository.getByRecoveryPassCode(recoveryCode);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'invalid recovery code',
        extensions: [{ field: 'recoveryCode', message: 'user does not exist' }],
      });
    }

    const expirationCodeDate = user.recoveryPassData?.expirationCodeDate;

    if (!expirationCodeDate || new Date() > expirationCodeDate) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'recovery code does not exist or is expired',
        extensions: [
          { field: 'recoveryCode', message: 'does not exist or is expired' },
        ],
      });
    }

    const newPasswordHash = await this.cryptoService.generateHash(newPassword);

    user.updatePasswordHash(newPasswordHash);
    await this.usersRepository.save(user);
  }
}
