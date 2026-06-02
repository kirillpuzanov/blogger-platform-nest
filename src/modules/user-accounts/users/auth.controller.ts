import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginInputDto } from './api/input-dto/login.input-dto';
import { AuthService } from './application/auth.service';
import { ApiBody } from '@nestjs/swagger';
import { RegistrationInputDto } from './api/input-dto/registration.input-dto';
import { RegistrationConfirmInputDto } from './api/input-dto/registration-confirm.input-dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: LoginInputDto })
  async login(@Body() body: LoginInputDto) {
    const tokens = await this.authService.login({
      password: body.password,
      loginOrEmail: body.loginOrEmail,
      deviceName: 'test-deviceName',
      ip: 'test-ip',
    });

    return { accessToken: tokens.accessToken };
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({ type: RegistrationInputDto })
  async registration(@Body() body: RegistrationInputDto) {
    return this.authService.registration({
      login: body.login,
      password: body.password,
      email: body.email,
    });
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({ type: RegistrationConfirmInputDto })
  async registrationConfirm(@Body() body: RegistrationConfirmInputDto) {
    return this.authService.registrationConfirm(body.code);
  }
}
