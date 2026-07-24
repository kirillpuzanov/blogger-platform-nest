import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../infra/users.repository';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain.exception';
import { CryptoService } from '../application/crypto.service';
import { JwtInternalService } from '../application/jwt.service';
import { randomUUID } from 'crypto';
import { LoginDomainDto } from '../domain/dto/login.domain.dto';
import { SessionsRepository } from '../infra/sessions.repository';
import { UserSqlDto } from '../domain/sql-entity-dto/user.sql-dto';
import { SessionSql } from '../domain/session.entity';
import { SessionSqlDto } from '../domain/sql-entity-dto/session.sql-dto';

export type LoginCommandReturn = { accessToken: string; refreshToken: string };

export class LoginCommand {
  constructor(public dto: LoginDomainDto) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(
    private usersRepository: UsersRepository,
    private sessionsRepository: SessionsRepository,
    private cryptoService: CryptoService,
    private jwtService: JwtInternalService,
  ) {}

  async execute({ dto }: LoginCommand): Promise<LoginCommandReturn> {
    const { password, loginOrEmail, ip, deviceName } = dto;

    /** находим пользователя по логину или емаил, проверяем валидность пароля */
    const user = await this.checkCredentials(password, loginOrEmail);

    const deviceId = randomUUID();

    /** если пользователь есть в системе и пароль верный, генерим токены и отдаем их, в refresh добавляем deviceId */
    const { accessToken, refreshToken } = this.jwtService.createTokens(
      user.id,
      deviceId,
    );

    const { exp, iat } = this.jwtService.decodeToken(refreshToken);

    const newSession: SessionSqlDto = SessionSql.createSession({
      ip,
      exp,
      iat,
      userId: user.id,
      deviceId,
      deviceName,
    });
    await this.sessionsRepository.createSession(newSession);

    return { accessToken, refreshToken };
  }

  private async checkCredentials(
    password: string,
    loginOrEmail: string,
  ): Promise<UserSqlDto> {
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
      user.password_hash,
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

// Mongoose

// @CommandHandler(LoginCommand)
// export class LoginUseCase implements ICommandHandler<LoginCommand> {
//   constructor(
//     @InjectModel(Session.modelName)
//     private SessionModel: SessionModelType,
//     private usersRepository: UsersRepository,
//     private sessionsRepository: SessionsRepository,
//     private cryptoService: CryptoService,
//     private jwtService: JwtInternalService,
//   ) {}
//
//   async execute({ dto }: LoginCommand): Promise<LoginCommandReturn> {
//     const { password, loginOrEmail, ip, deviceName } = dto;
//
//     /** находим пользователя по логину или емаил, проверяем валидность пароля */
//     const user = await this.checkCredentials(password, loginOrEmail);
//
//     const deviceId = randomUUID();
//     const userId = user._id.toString();
//
//     /** если пользователь есть в системе и пароль верный, генерим токены и отдаем их, в refresh добавляем deviceId */
//     const { accessToken, refreshToken } = this.jwtService.createTokens(
//       userId,
//       deviceId,
//     );
//
//     const { exp, iat } = this.jwtService.decodeToken(refreshToken);
//     const session: SessionDocument = this.SessionModel.createSession({
//       ip,
//       exp,
//       iat,
//       userId,
//       deviceId,
//       deviceName,
//     });
//
//     await this.sessionsRepository.save(session);
//
//     return { accessToken, refreshToken };
//   }
//
//   private async checkCredentials(
//     password: string,
//     loginOrEmail: string,
//   ): Promise<UserDocument> {
//     const user = await this.usersRepository.getByLoginOrEmail(loginOrEmail);
//
//     if (!user) {
//       throw new DomainException({
//         code: DomainExceptionCode.Unauthorized,
//         message: 'unauthorized',
//       });
//     }
//
//     /** сравнение хэша из БД, с хешом логина переданным при аутентификации */
//     const isCorrectPass = await this.cryptoService.checkPass(
//       password,
//       user.passwordHash,
//     );
//
//     if (!isCorrectPass) {
//       throw new DomainException({
//         code: DomainExceptionCode.Unauthorized,
//         message: 'unauthorized',
//       });
//     }
//
//     return user;
//   }
// }
