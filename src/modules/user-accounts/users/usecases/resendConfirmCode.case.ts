import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../domain/user.entity';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain.exception';
import { UsersRepository } from '../infra/users.repository';
import { EmailService } from '../../../notifications/email.service';
import { MailTemplates } from '../api/view-dto/mail-templates';

export class ResendConfirmCodeCommand {
  constructor(public email: string) {}
}

@CommandHandler(ResendConfirmCodeCommand)
export class ResendConfirmCodeUseCase implements ICommandHandler<ResendConfirmCodeCommand> {
  constructor(
    @InjectModel(User.modelName)
    private usersRepository: UsersRepository,
    private emailService: EmailService,
  ) {}

  async execute({ email }: ResendConfirmCodeCommand): Promise<void> {
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
}
