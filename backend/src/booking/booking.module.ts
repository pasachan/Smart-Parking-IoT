import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Booking } from './booking.entity';
import { UserModule } from '../user/user.module';
import { SlotModule } from '../slot/slot.module';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    UserModule, // Import UserModule to use UserService
    SlotModule, // Import SlotModule to use SlotService
    MailerModule, // Import MailerModule here
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingsModule {}
