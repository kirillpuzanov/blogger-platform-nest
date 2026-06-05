import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LoginInputDto } from './api/input-dto/login.input-dto';
import { ApiBody } from '@nestjs/swagger';
import { RegistrationInputDto } from './api/input-dto/registration.input-dto';
import { RegistrationConfirmInputDto } from './api/input-dto/registration-confirm.input-dto';
import { RegistrationResendCodeInputDto } from './api/input-dto/registration-resend-code.input-dto';
import { NewPasswordInputDto } from './api/input-dto/new-password.input-dto';
import { AccessAuthGuard } from './guards/access-auth.guard';
import { ExtractUserFromRequest } from './decorators/extract-user-from-request.decorator';
import { UsersQueryRepository } from './infra/users.query-repository';
import { MeViewDto } from './api/view-dto/me.view-dto';
import { CommandBus } from '@nestjs/cqrs';
import { LoginCommand, LoginCommandReturn } from './usecases/login.case';
import { RegistrationCommand } from './usecases/registration.case';
import { RegistrationConfirmCommand } from './usecases/registrationConfirm.case';
import { ResendConfirmCodeCommand } from './usecases/resendConfirmCode.case';
import { RecoveryPassCommand } from './usecases/recoveryPass.case';
import { SetNewPassCommand } from './usecases/setNewPass.case';

@Controller('auth')
export class AuthController {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('me')
  @UseGuards(AccessAuthGuard)
  async me(@ExtractUserFromRequest() user: { id: string }) {
    const me = await this.usersQueryRepository.getByIdOrFail(user.id);
    const { id, login, email } = me;
    const meView: MeViewDto = { userId: id, login, email };
    return meView;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: LoginInputDto })
  async login(@Body() body: LoginInputDto) {
    const tokens = await this.commandBus.execute<
      LoginCommand,
      LoginCommandReturn
    >(
      new LoginCommand({
        password: body.password,
        loginOrEmail: body.loginOrEmail,
        deviceName: 'test-deviceName',
        ip: 'test-ip',
      }),
    );

    return { accessToken: tokens.accessToken };
  }

  @Post('registration')
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({ type: RegistrationConfirmInputDto })
  async registrationConfirm(@Body() body: RegistrationConfirmInputDto) {
    return await this.commandBus.execute<RegistrationConfirmCommand, void>(
      new RegistrationConfirmCommand(body.code),
    );
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({ type: RegistrationResendCodeInputDto })
  async resendConfirmCode(@Body() body: RegistrationResendCodeInputDto) {
    return this.commandBus.execute<ResendConfirmCodeCommand, void>(
      new ResendConfirmCodeCommand(body.email),
    );
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({ type: RegistrationResendCodeInputDto })
  async recoveryPass(@Body() body: RegistrationResendCodeInputDto) {
    return this.commandBus.execute<RecoveryPassCommand, void>(
      new RecoveryPassCommand(body.email),
    );
  }

  @Post('new-password')
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
}
