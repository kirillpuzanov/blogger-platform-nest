import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginInputDto } from './api/input-dto/login.input-dto';
import { AuthService } from './application/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginInputDto) {
    const tokens = await this.authService.login({
      password: body.password,
      loginOrEmail: body.loginOrEmail,
      deviceName: 'test-deviceName',
      ip: 'test-ip',
    });

    return { accessToken: tokens.accessToken };
  }
}
