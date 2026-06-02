import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(
    email: string,
    template: string,
    subject: string = 'Подтвердите регистрацию',
  ): Promise<boolean> {
    const sendRes: unknown = await this.mailerService.sendMail({
      from: '<Nest blogger platform>',
      to: email,
      subject: subject,
      html: template,
    });

    return Boolean(sendRes);
  }
}
