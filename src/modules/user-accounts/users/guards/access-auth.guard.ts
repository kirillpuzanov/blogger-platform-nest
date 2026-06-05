import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain.exception';
import { JwtInternalService } from '../application/jwt.service';
import { settings } from '../../../../setup/settings';

@Injectable()
export class AccessAuthGuard implements CanActivate {
  constructor(private jwtService: JwtInternalService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }

    const token = authHeader.split(' ')[1];
    const { userId } = this.jwtService.verifyToken(
      token,
      settings.JWT_SECRET_ACCESS,
    );

    if (userId) {
      request.user = { id: userId };
      return true;
    }

    throw new DomainException({
      code: DomainExceptionCode.Unauthorized,
      message: 'Unauthorized',
    });
  }
}
