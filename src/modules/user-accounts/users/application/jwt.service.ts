import { Injectable } from '@nestjs/common';
import { settings } from '../../../../setup/settings';
import { JwtService } from '@nestjs/jwt';

type DecodedTokenData = {
  userId: string;
  deviceId: string;
  exp: number;
  iat: number;
};

@Injectable()
export class JwtInternalService {
  constructor(private readonly jwtService: JwtService) {}

  createTokens(
    userId: string,
    deviceId: string,
  ): { accessToken: string; refreshToken: string } {
    const accessToken = this.jwtService.sign(
      { userId },
      { secret: settings.JWT_SECRET, expiresIn: '5 Min' },
    );
    const refreshToken = this.jwtService.sign(
      { userId, deviceId },
      { secret: settings.JWT_SECRET, expiresIn: '20 Min' },
    );

    return { accessToken, refreshToken };
  }

  decodeToken(token: string): DecodedTokenData {
    const decoded = this.jwtService.decode<DecodedTokenData>(token);
    return {
      userId: decoded.userId,
      deviceId: decoded.deviceId,
      /**  переводим в миллисеунды, для удобства сравнения дальше */
      exp: decoded?.exp ? decoded.exp * 1000 : Date.now(),
      iat: decoded?.iat ? decoded.iat * 1000 : Date.now(),
    };
  }

  verifyToken(token: string): Partial<DecodedTokenData> {
    try {
      const verify = this.jwtService.verify<DecodedTokenData>(token, {
        secret: settings.JWT_SECRET,
      });
      return {
        userId: verify.userId,
        deviceId: verify.deviceId,
        iat: verify?.iat ? verify?.iat * 1000 : Date.now(),
      };
    } catch {
      return { userId: undefined, deviceId: undefined, iat: Date.now() };
    }
  }
}
