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
import { RegistrationDto } from '../dto/registration.dto';
import { EmailService } from '../../../notifications/email.service';
import { MailTemplates } from '../api/view-dto/mail-templates';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.modelName) private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    private jwtService: JwtInternalService,
    private emailService: EmailService,
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

  async registration({
    login,
    password,
    email,
  }: RegistrationDto): Promise<void> {
    /** проверяем, что это новый пользователь (логин пароль на уникальность) */
    const emailAlreadyExist =
      await this.usersRepository.checkUniqueEmailOrLogin(email);

    if (emailAlreadyExist) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'already exist',
        extensions: [{ field: 'email', message: 'this email already exist' }],
      });
    }

    const loginAlreadyExist =
      await this.usersRepository.checkUniqueEmailOrLogin(login);

    if (loginAlreadyExist) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'already exist',
        extensions: [{ field: 'login', message: 'this login already exist' }],
      });
    }

    const passwordHash = await this.cryptoService.generateHash(password);

    /** сохраняем пользователя в БД, с флагом неподтвержденной регистрации
     * и мета инф. для последующего подтверждения регистрации */
    const user = this.UserModel.createUser({ login, email, passwordHash });

    await this.usersRepository.save(user);

    this.emailService
      .sendMail(
        user.email,
        MailTemplates.registration(user.emailConfirmation.confirmationCode),
      )
      .catch((error) => console.error('error send email', error));
  }

  async registrationConfirm(code: string): Promise<void> {
    const user = await this.usersRepository.getByConfirmCode(code);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'invalid code',
        extensions: [{ field: 'code', message: 'user does not exist' }],
      });
    }

    if (user.emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'invalid code',
        extensions: [{ field: 'code', message: 'user is already confirmed' }],
      });
    }

    if (new Date() > user.emailConfirmation.expirationDate) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'code id expired',
        extensions: [
          { field: 'code', message: 'confirmation code is expired' },
        ],
      });
    }

    user.updateIsConfirm();
    await this.usersRepository.save(user);
  }

  async resendConfirmCode(email: string): Promise<void> {
    const user = await this.usersRepository.getByLoginOrEmail(email);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'user with this email does not exist',
        extensions: [{ field: 'email', message: 'user does not exist' }],
      });
    }

    if (user.emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'already confirmed',
        extensions: [{ field: 'email', message: 'user is already confirmed' }],
      });
    }

    user.updateConfirmationData();
    await user.save();

    this.emailService
      .sendMail(
        user.email,
        MailTemplates.registration(user.emailConfirmation.confirmationCode),
      )
      .catch((error) => console.error('error send email', error));
  }

  async recoveryPassword(email: string): Promise<void> {
    const user = await this.usersRepository.getByLoginOrEmail(email);

    /** если такого пользователя нет все-равно вернем 204, чтобы не раскрывать существование email */
    if (!user) {
      return;
    }

    user.updateConfirmationData();
    await this.usersRepository.save(user);

    this.emailService
      .sendMail(
        user.email,
        MailTemplates.registration(user.emailConfirmation.confirmationCode),
        'Подтвердите изменение пароля',
      )
      .catch((error) => console.error('error send recovery pass email', error));
  }

  async setNewPassword(
    newPassword: string,
    recoveryCode: string,
  ): Promise<void> {
    const user = await this.usersRepository.getByRecoveryPassCode(recoveryCode);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'invalid recovery code',
        extensions: [{ field: 'recoveryCode', message: 'user does not exist' }],
      });
    }

    const expirationCodeDate = user.recoveryPassData?.expirationCodeDate;

    if (!expirationCodeDate || new Date() > expirationCodeDate) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'recovery code does not exist or is expired',
        extensions: [
          { field: 'recoveryCode', message: 'does not exist or is expired' },
        ],
      });
    }

    const newPasswordHash = await this.cryptoService.generateHash(newPassword);

    user.updatePasswordHash(newPasswordHash);
    await this.usersRepository.save(user);
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
