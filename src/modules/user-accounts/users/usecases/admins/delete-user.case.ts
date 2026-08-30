import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infra/users.repository';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../../core/exceptions/domain.exception';
import { SessionsRepository } from '../../infra/sessions.repository';

export class DeleteUserCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(
    private usersRepository: UsersRepository,
    private sessionsRepository: SessionsRepository,
  ) {}

  async execute({ id }: DeleteUserCommand): Promise<void> {
    const isDeleted = await this.usersRepository.deleteOne(id);

    if (isDeleted) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'user is not exists',
      });
    }
    await this.sessionsRepository.deleteAllUserSessions(id);
  }
}

// Mongoose
// @CommandHandler(DeleteUserCommand)
// export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
//   constructor(
//     private usersRepository: UsersRepository,
//     private sessionsRepository: SessionsRepository,
//   ) {}
//
//   async execute({ id }: DeleteUserCommand): Promise<void> {
//     const deletedCount = await this.usersRepository.deleteOne(id);
//
//     if (deletedCount < 1) {
//       throw new DomainException({
//         code: DomainExceptionCode.NotFound,
//         message: 'user is not exists',
//       });
//     }
//     await this.sessionsRepository.deleteAllUserSessions(id);
//   }
// }
