import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { type Request, type Response } from 'express';
import { LoginInputDto } from './api/input-dto/login.input-dto';
import { ApiBearerAuth, ApiBody, ApiCookieAuth } from '@nestjs/swagger';
import { RegistrationInputDto } from './api/input-dto/registration.input-dto';
import { RegistrationConfirmInputDto } from './api/input-dto/registration-confirm.input-dto';
import { RegistrationResendCodeInputDto } from './api/input-dto/registration-resend-code.input-dto';
import { NewPasswordInputDto } from './api/input-dto/new-password.input-dto';
import { AccessAuthGuard } from './guards/access-auth.guard';
import { ExtractUserFromRequest } from '../../../core/decorators/extract-user-from-request.decorator';
import { UsersQueryRepository } from './infra/users.query-repository';
import { MeViewDto } from './api/view-dto/me.view-dto';
import { CommandBus } from '@nestjs/cqrs';
import { LoginCommand, LoginCommandReturn } from './usecases/login.case';
import { RegistrationCommand } from './usecases/registration.case';
import { RegistrationConfirmCommand } from './usecases/registrationConfirm.case';
import { ResendConfirmCodeCommand } from './usecases/resendConfirmCode.case';
import { RecoveryPassCommand } from './usecases/recoveryPass.case';
import { SetNewPassCommand } from './usecases/setNewPass.case';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import {
  RefreshTokenCommand,
  RefreshTokenCommandReturn,
} from './usecases/refreshToken.case';
import { LogoutCommand } from './usecases/logout.case';

//todo
// import { IpRestrictionGuard } from '../../../core/guards/ip-restriction.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('me')
  @UseGuards(AccessAuthGuard)
  @ApiBearerAuth('access_token')
  async me(@ExtractUserFromRequest() user: { id: string }) {
    const me = await this.usersQueryRepository.getByIdOrFail(user.id);
    const { id, login, email } = me;
    const meView: MeViewDto = { userId: id, login, email };
    return meView;
  }

  @Post('login')
  // @UseGuards(IpRestrictionGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: LoginInputDto })
  async login(
    @Body() body: LoginInputDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const ip = req.ip ?? '';
    const ua = req.useragent;
    const deviceName = `${ua?.browser ?? 'unknown'} ${ua?.version ?? 'unknown'}`;

    const tokens = await this.commandBus.execute<
      LoginCommand,
      LoginCommandReturn
    >(
      new LoginCommand({
        password: body.password,
        loginOrEmail: body.loginOrEmail,
        deviceName,
        ip,
      }),
    );

    return res
      .cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .status(HttpStatus.OK)
      .json({ accessToken: tokens.accessToken });
  }

  @Post('registration')
  // @UseGuards(IpRestrictionGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({ type: RegistrationInputDto })
  async registration(@Body() body: RegistrationInputDto) {
    return await this.commandBus.execute<RegistrationCommand, void>(
      new RegistrationCommand({
        login: body.login,
        password: body.password,
        email: body.email,
      }),
    );
  }

  @Post('registration-confirmation')
  // @UseGuards(IpRestrictionGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({ type: RegistrationConfirmInputDto })
  async registrationConfirm(@Body() body: RegistrationConfirmInputDto) {
    return await this.commandBus.execute<RegistrationConfirmCommand, void>(
      new RegistrationConfirmCommand(body.code),
    );
  }

  @Post('registration-email-resending')
  // @UseGuards(IpRestrictionGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({ type: RegistrationResendCodeInputDto })
  async resendConfirmCode(@Body() body: RegistrationResendCodeInputDto) {
    console.log('registration-email-resending');
    return this.commandBus.execute<ResendConfirmCodeCommand, void>(
      new ResendConfirmCodeCommand(body.email),
    );
  }

  @Post('password-recovery')
  // @UseGuards(IpRestrictionGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({ type: RegistrationResendCodeInputDto })
  async recoveryPass(@Body() body: RegistrationResendCodeInputDto) {
    return this.commandBus.execute<RecoveryPassCommand, void>(
      new RecoveryPassCommand(body.email),
    );
  }

  @Post('new-password')
  // @UseGuards(IpRestrictionGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({ type: NewPasswordInputDto })
  async setNewPassword(@Body() body: NewPasswordInputDto) {
    return this.commandBus.execute<SetNewPassCommand, void>(
      new SetNewPassCommand({
        newPassword: body.newPassword,
        recoveryCode: body.recoveryCode,
      }),
    );
  }

  @Post('refresh-token')
  @UseGuards(RefreshAuthGuard)
  @ApiCookieAuth('refresh_token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const oldRefreshToken = req.cookies?.refreshToken as string;

    const { accessToken, refreshToken } = await this.commandBus.execute<
      RefreshTokenCommand,
      RefreshTokenCommandReturn
    >(new RefreshTokenCommand({ oldRefreshToken }));

    return res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .status(HttpStatus.OK)
      .json({ accessToken: accessToken });
  }

  @Post('logout')
  @UseGuards(RefreshAuthGuard)
  @ApiCookieAuth('refresh_token')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refreshToken as string;

    await this.commandBus.execute<LogoutCommand, void>(
      new LogoutCommand({ refreshToken }),
    );

    return res
      .clearCookie('refreshToken', { path: '/' })
      .sendStatus(HttpStatus.NO_CONTENT);
  }
}
