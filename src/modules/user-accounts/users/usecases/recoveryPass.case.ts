import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../infra/users.repository';
import { EmailService } from '../../../notifications/email.service';
import { MailTemplates } from '../api/view-dto/mail-templates';

export class RecoveryPassCommand {
  constructor(public email: string) {}
}

@CommandHandler(RecoveryPassCommand)
export class RecoveryPassUseCase implements ICommandHandler<RecoveryPassCommand> {
  constructor(
    private usersRepository: UsersRepository,
    private emailService: EmailService,
  ) {}

  async execute({ email }: RecoveryPassCommand): Promise<void> {
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
}
