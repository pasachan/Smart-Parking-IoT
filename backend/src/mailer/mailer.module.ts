import { Module } from '@nestjs/common';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { MailerService } from './mailer.service';

@Module({
  imports: [
    NestMailerModule.forRoot({
      transport: {
        host: 'smtp.zoho.eu', // replace with your SMTP server
        secure: true,
        auth: {
          user: process.env.EMAIL_USER ,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
      defaults: {
        from: `"Smart Parking System" <${process.env.EMAIL_USER}>`,
      },
      template: {
        dir: join(__dirname, 'templates'), // This works if templates are present in dist/mailer/templates after build
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailerService],
  exports: [MailerService], // Export MailerService for use in other modules
})
export class MailerModule {}
