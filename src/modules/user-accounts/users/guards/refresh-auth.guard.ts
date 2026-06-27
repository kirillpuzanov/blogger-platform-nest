import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { JwtInternalService } from '../application/jwt.service';
import { CoreConfig } from '../../../../config/core.config';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain.exception';
import { SessionsRepository } from '../infra/sessions.repository';

interface RequestWithCookies extends Request {
  cookies: {
    refreshToken?: string;
  };
}

@Injectable()
export class RefreshAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtInternalService,
    private coreConfig: CoreConfig,
    private sessionsRepository: SessionsRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithCookies>();
    const refreshToken = request.cookies?.refreshToken;

    if (!refreshToken) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }

    const { userId, deviceId, iat } = this.jwtService.verifyToken(
      refreshToken,
      this.coreConfig.jwtSecretRefresh,
    );

    if (!userId || !deviceId) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }

    const currentSession = await this.sessionsRepository.getSession(deviceId);

    /** проверяем валидность полученного refreshToken по метке exp в BD в активной сесии девайса */
    if (currentSession) {
      /** если переданный токен еще не протух, пренадлежит текущему пользователю, с той же дадой выпуска -> пропускаем дальше */
      if (
        currentSession.exp > Date.now() &&
        currentSession.iat === iat &&
        userId === currentSession.userId
      ) {
        request.user = { id: userId };
        return true;
      }
    }
    /** Просто не пускаем, нельзя удалять сессию, не знаем какое из условий не прошло.
     * можно удалить чужую сессию, если как то получили чужой userId */
    throw new DomainException({
      code: DomainExceptionCode.Unauthorized,
      message: 'Unauthorized',
    });
  }
}
