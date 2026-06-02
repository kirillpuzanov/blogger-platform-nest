import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginInputDto } from './api/input-dto/login.input-dto';
import { AuthService } from './application/auth.service';
import { ApiBody } from '@nestjs/swagger';

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
}
