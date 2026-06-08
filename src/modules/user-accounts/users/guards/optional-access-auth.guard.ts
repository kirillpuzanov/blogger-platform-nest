import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { JwtInternalService } from '../application/jwt.service';

@Injectable()
export class OptionalAccessAuthGuard implements CanActivate {
  constructor(private jwtService: JwtInternalService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return true;
    }

    const token = authHeader.split(' ')[1];
    const userInfo = this.jwtService.decodeToken(token);

    if (userInfo?.userId) {
      request.user = { id: userInfo?.userId };
    }
    return true;
  }
}
