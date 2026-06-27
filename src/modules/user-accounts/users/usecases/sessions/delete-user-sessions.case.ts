import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../../infra/sessions.repository';
import { JwtInternalService } from '../../application/jwt.service';

export class DeleteUserSessionsCommand {
  constructor(public dto: { refreshToken: string }) {}
}

@CommandHandler(DeleteUserSessionsCommand)
export class DeleteUserSessionsUseCase implements ICommandHandler<DeleteUserSessionsCommand> {
  constructor(
    private sessionsRepository: SessionsRepository,
    private jwtService: JwtInternalService,
  ) {}

  async execute({ dto }: DeleteUserSessionsCommand): Promise<void> {
    const { userId, deviceId } = this.jwtService.decodeToken(dto.refreshToken);

    await this.sessionsRepository.deleteOtherMySessions(userId, deviceId);
  }
}
