import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { ApiCookieAuth } from '@nestjs/swagger';
import { ExtractUserFromRequest } from '../../../core/decorators/extract-user-from-request.decorator';
import type { Request } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteUserSessionsCommand } from './usecases/sessions/delete-user-sessions.case';
import { DeleteUserSessionCommand } from './usecases/sessions/delete-user-session.case';
import { SessionsQueryRepository } from './infra/sessions.query-repository';

@Controller('security')
@UseGuards(RefreshAuthGuard)
@ApiCookieAuth('refresh_token')
export class SessionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private sessionsQueryRepository: SessionsQueryRepository,
  ) {}

  @Get('devices')
  @HttpCode(HttpStatus.OK)
  async getUserSessions(@ExtractUserFromRequest() user: { id: string }) {
    return this.sessionsQueryRepository.getUserActiveSessions(user.id);
  }

  @Delete('devices')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUserSessions(@Req() req: Request) {
    const refreshToken = req.cookies?.refreshToken as string;

    return await this.commandBus.execute<DeleteUserSessionsCommand, void>(
      new DeleteUserSessionsCommand({ refreshToken }),
    );
  }

  @Delete('devices/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUserSession(
    @ExtractUserFromRequest() user: { id: string },
    @Param('id') id: string,
  ) {
    const userId = user.id;
    const deviceId = id;

    return await this.commandBus.execute<DeleteUserSessionCommand, void>(
      new DeleteUserSessionCommand({ userId, deviceId }),
    );
  }
}
