import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CoreConfig } from '../../../../config/core.config';

type DecodedTokenData = {
  userId: string;
  deviceId: string;
  exp: number;
  iat: number;
};

@Injectable()
export class JwtInternalService {
  constructor(
    private readonly jwtService: JwtService,
    private coreConfig: CoreConfig,
  ) {}

  createTokens(
    userId: string,
    deviceId: string,
  ): { accessToken: string; refreshToken: string } {
    const accessToken = this.jwtService.sign(
      { userId },
      {
        secret: this.coreConfig.jwtSecretAccess,
        expiresIn: this.coreConfig.accessExpireIn,
      },
    );
    const refreshToken = this.jwtService.sign(
      { userId, deviceId },
      {
        secret: this.coreConfig.jwtSecretRefresh,
        expiresIn: this.coreConfig.refreshExpireIn,
      },
    );

    return { accessToken, refreshToken };
  }

  decodeToken(token: string): DecodedTokenData {
    const decoded = this.jwtService.decode<DecodedTokenData>(token);
    return {
      userId: decoded?.userId,
      deviceId: decoded?.deviceId,
      /**  переводим в миллисеунды, для удобства сравнения дальше */
      exp: decoded?.exp ? decoded.exp * 1000 : Date.now(),
      iat: decoded?.iat ? decoded.iat * 1000 : Date.now(),
    };
  }

  verifyToken(token: string, secret: string): Partial<DecodedTokenData> {
    try {
      const verify = this.jwtService.verify<DecodedTokenData>(token, {
        secret,
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
