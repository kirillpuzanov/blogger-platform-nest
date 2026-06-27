import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtInternalService } from '../application/jwt.service';
import { RefreshTokenDomainDto } from '../domain/dto/refresh-token.domain.dto';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain.exception';
import { SessionsRepository } from '../infra/sessions.repository';

export type RefreshTokenCommandReturn = {
  accessToken: string;
  refreshToken: string;
};

export class RefreshTokenCommand {
  constructor(public dto: RefreshTokenDomainDto) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    private jwtService: JwtInternalService,
    private sessionsRepository: SessionsRepository,
  ) {}

  async execute({
    dto,
  }: RefreshTokenCommand): Promise<RefreshTokenCommandReturn> {
    /** проверка валидности текущего токена уже сделана в refreshTokenGuard */
    const { oldRefreshToken } = dto;

    const { userId, deviceId } = this.jwtService.decodeToken(oldRefreshToken);

    const session = await this.sessionsRepository.getSession(deviceId);

    if (!session) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }

    /** создаем новую пару токенов */
    const { accessToken, refreshToken } = this.jwtService.createTokens(
      userId,
      deviceId,
    );

    /** берем новые данные жизни токена */
    const { iat, exp } = this.jwtService.decodeToken(refreshToken);

    /** обновляем данные жизни текущей сессии */
    session.updateSession({ userId, deviceId, iat, exp });

    await this.sessionsRepository.save(session);

    return { accessToken, refreshToken };
  }
}
