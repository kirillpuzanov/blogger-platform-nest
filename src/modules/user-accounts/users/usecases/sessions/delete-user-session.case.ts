import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../../core/exceptions/domain.exception';
import { SessionsRepository } from '../../infra/sessions.repository';

export class DeleteUserSessionCommand {
  constructor(public dto: { userId: string; deviceId: string }) {}
}

@CommandHandler(DeleteUserSessionCommand)
export class DeleteUserSessionUseCase implements ICommandHandler<DeleteUserSessionCommand> {
  constructor(private sessionsRepository: SessionsRepository) {}

  async execute({ dto }: DeleteUserSessionCommand): Promise<void> {
    const { userId, deviceId } = dto;

    const deletedSession = await this.sessionsRepository.getSession(deviceId);

    if (!deletedSession) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'session not found',
      });
    }

    if (deletedSession.userId !== userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'you cannot delete other sessions',
      });
    }

    await this.sessionsRepository.deleteSession(userId, deviceId);
  }
}
