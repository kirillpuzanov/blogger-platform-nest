import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtInternalService } from '../application/jwt.service';
import { LogoutDto } from '../dto/logout.dto';
import { SessionsRepository } from '../infra/sessions.repository';

export class LogoutCommand {
  constructor(public dto: LogoutDto) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
  constructor(
    private sessionsRepository: SessionsRepository,
    private jwtService: JwtInternalService,
  ) {}

  async execute({ dto }: LogoutCommand): Promise<void> {
    /** проверка валидности текущего токена уже сделана в refreshTokenGuard */
    const { refreshToken } = dto;

    const { userId, deviceId } = this.jwtService.decodeToken(refreshToken);

    /** удаляем текущую сессию */
    await this.sessionsRepository.deleteSession(userId, deviceId);
  }
}
