import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infra/users.repository';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../domain/user.entity';
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
    @InjectModel(User.modelName)
    private usersRepository: UsersRepository,
    private sessionsRepository: SessionsRepository,
  ) {}

  async execute({ id }: DeleteUserCommand): Promise<void> {
    const deletedCount = await this.usersRepository.deleteOne(id);

    if (deletedCount < 1) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'user is not exists',
      });
    }
    await this.sessionsRepository.deleteAllUserSessions(id);
  }
}
