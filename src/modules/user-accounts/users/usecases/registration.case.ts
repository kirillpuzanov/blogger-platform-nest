import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { User, type UserModelType } from '../domain/user.entity';
import { UsersRepository } from '../infra/users.repository';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain.exception';
import { CryptoService } from '../application/crypto.service';
import { RegistrationDto } from '../dto/registration.dto';
import { MailTemplates } from '../api/view-dto/mail-templates';
import { EmailService } from '../../../notifications/email.service';

export class RegistrationCommand {
  constructor(public dto: RegistrationDto) {}
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase implements ICommandHandler<RegistrationCommand> {
  constructor(
    @InjectModel(User.modelName)
    private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    private emailService: EmailService,
  ) {}

  async execute({ dto }: RegistrationCommand): Promise<void> {
    const { login, password, email } = dto;
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
}
