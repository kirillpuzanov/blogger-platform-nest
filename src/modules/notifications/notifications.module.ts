import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';
import { settings } from '../../setup/settings';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: settings.EMAIL,
          pass: settings.EMAIL_PASS,
        },
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class NotificationsModule {}
