import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain.exception';
import { UsersRepository } from '../infra/users.repository';

export class RegistrationConfirmCommand {
  constructor(public code: string) {}
}

@CommandHandler(RegistrationConfirmCommand)
export class RegistrationConfirmUseCase implements ICommandHandler<RegistrationConfirmCommand> {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ code }: RegistrationConfirmCommand): Promise<void> {
    const user = await this.usersRepository.getByConfirmCode(code);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'invalid code',
        extensions: [{ field: 'code', message: 'user does not exist' }],
      });
    }

    if (user.is_confirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'invalid code',
        extensions: [{ field: 'code', message: 'user is already confirmed' }],
      });
    }

    if (new Date() > user.confirmation_expiration!) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'code id expired',
        extensions: [
          { field: 'code', message: 'confirmation code is expired' },
        ],
      });
    }

    await this.usersRepository.updateIsConfirm(user.id);
  }
}

// Mongoose
// @CommandHandler(RegistrationConfirmCommand)
// export class RegistrationConfirmUseCase implements ICommandHandler<RegistrationConfirmCommand> {
//   constructor(private usersRepository: UsersRepository) {}
//
//   async execute({ code }: RegistrationConfirmCommand): Promise<void> {
//     const user = await this.usersRepository.getByConfirmCode(code);
//
//     if (!user) {
//       throw new DomainException({
//         code: DomainExceptionCode.BadRequest,
//         message: 'invalid code',
//         extensions: [{ field: 'code', message: 'user does not exist' }],
//       });
//     }
//
//     if (user.emailConfirmation.isConfirmed) {
//       throw new DomainException({
//         code: DomainExceptionCode.BadRequest,
//         message: 'invalid code',
//         extensions: [{ field: 'code', message: 'user is already confirmed' }],
//       });
//     }
//
//     if (new Date() > user.emailConfirmation.expirationDate) {
//       throw new DomainException({
//         code: DomainExceptionCode.BadRequest,
//         message: 'code id expired',
//         extensions: [
//           { field: 'code', message: 'confirmation code is expired' },
//         ],
//       });
//     }
//
//     user.updateIsConfirm();
//     await this.usersRepository.save(user);
//   }
// }
