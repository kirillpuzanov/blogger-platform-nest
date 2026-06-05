import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserDocument } from '../domain/user.entity';
import { UsersRepository } from '../infra/users.repository';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain.exception';
import { CryptoService } from '../application/crypto.service';
import { JwtInternalService } from '../application/jwt.service';
import { randomUUID } from 'crypto';
import { LoginDomainDto } from '../domain/dto/login.domain.dto';

export type LoginCommandReturn = { accessToken: string; refreshToken: string };

export class LoginCommand {
  constructor(public dto: LoginDomainDto) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    private jwtService: JwtInternalService,
  ) {}

  async execute({ dto }: LoginCommand): Promise<LoginCommandReturn> {
    const { password, loginOrEmail } = dto;
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

  private async checkCredentials(
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
