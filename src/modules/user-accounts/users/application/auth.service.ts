import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { LoginDomainDto } from '../domain/dto/login.domain.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, type UserModelType } from '../domain/user.entity';
import { UsersRepository } from '../infra/users.repository';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain.exception';
import { CryptoService } from './crypto.service';
import { JwtInternalService } from './jwt.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.modelName) private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    private jwtService: JwtInternalService,
  ) {}

  async login({
    password,
    loginOrEmail,
    // ip,
    // deviceName,
  }: LoginDomainDto): Promise<{ accessToken: string; refreshToken: string }> {
    /** находим пользователя по логину или емаил, проверяем валидность пароля */
    const user = await this.checkCredentials(password, loginOrEmail);

    const deviceId = randomUUID();
    const userId = user._id.toString();

    /** если пользователь есть в системе и пароль верный, генерим токены и отдаем их, в refresh добавляем deviceId */
    const { accessToken, refreshToken } = this.jwtService.createTokens(
      userId,
      deviceId,
    );

    return { accessToken, refreshToken };

    // todo - создаем сессию для этого утстройства
    // ...
  }

  async checkCredentials(
    password: string,
    loginOrEmail: string,
  ): Promise<UserDocument> {
    const user = await this.usersRepository.getByLoginOrEmail(loginOrEmail);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'unauthorized',
      });
    }

    /** сравнение хэша из БД, с хешом логина переданным при аутентификации */
    const isCorrectPass = await this.cryptoService.checkPass(
      password,
      user.passwordHash,
    );

    if (!isCorrectPass) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'unauthorized',
      });
    }

    return user;
  }
}
