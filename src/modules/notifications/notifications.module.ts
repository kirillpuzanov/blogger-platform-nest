import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';
import { CoreConfig } from '../../config/core.config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [CoreConfig],
      useFactory: (coreConfig: CoreConfig) => ({
        transport: {
          service: 'gmail',
          auth: {
            user: coreConfig.email,
            pass: coreConfig.emailPass,
          },
        },
      }),
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class NotificationsModule {}
