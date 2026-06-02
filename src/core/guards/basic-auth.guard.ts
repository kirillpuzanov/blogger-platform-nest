import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import {
  DomainException,
  DomainExceptionCode,
} from '../exceptions/domain.exception';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  private readonly authType = 'Basic';
  private readonly validUsername = 'admin';
  private readonly validPassword = 'qwerty';

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith(this.authType)) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }

    const token = authHeader.split(' ')[1];

    const credentials = Buffer.from(token, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');

    if (username === this.validUsername && password === this.validPassword) {
      return true;
    } else {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }
  }
}
