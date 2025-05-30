import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlotController } from './slot.controller';
import { SlotService } from './slot.service';
import { Slot } from './slot.entity';
import { Booking } from '../booking/booking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Slot, Booking]),
  ],
  controllers: [SlotController],
  providers: [SlotService],
  exports: [SlotService], // Explicitly export SlotService so it can be used in other modules
})
export class SlotModule {}
