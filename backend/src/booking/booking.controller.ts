import { Controller, Get, Post, Body, Param, Patch, Delete, NotFoundException, HttpStatus, HttpCode } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  async create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.createBooking(createBookingDto);
  }

  @Get()
  async findAll() {
    return this.bookingService.getAllBookings();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.bookingService.getBookingById(+id);
  }

  @Get('user/:email')
  async findUserBookings(@Param('email') email: string) {
    return this.bookingService.getBookingsByEmail(email);
  }

  @Get('rfid/:rfIdTagId')
  async findByRfid(@Param('rfIdTagId') rfIdTagId: string) {
    const booking = await this.bookingService.findBookingByRfIdTag(rfIdTagId);
    if (!booking) {
      throw new NotFoundException(`No active booking found for RFID tag ${rfIdTagId}`);
    }
    return booking;
  }

  @Get('status/active')
  async findActiveBookings() {
    return this.bookingService.getActiveBookings();
  }

  @Get('verify-rfid/:rfIdTagId')
  async verifyRfid(@Param('rfIdTagId') rfIdTagId: string) {
    const booking = await this.bookingService.findBookingByRfIdTag(rfIdTagId);
    if (!booking) {
      throw new NotFoundException(`No active booking found for this RFID tag`);
    }
    return {
      statusCode: HttpStatus.OK,
      Name: booking.name
    };
  }

  @Patch(':id/complete')
  async completeBooking(@Param('id') id: string) {
    await this.bookingService.completeBooking(+id);
    return { message: 'Booking marked as completed' };
  }

  @Patch('scan-rfid/:rfIdTagId')
  async scanRfid(@Param('rfIdTagId') rfIdTagId: string) {
    const result = await this.bookingService.handleRfidScan(rfIdTagId);
    
    if (result.action === 'checked_in') {
      return {
        statusCode: HttpStatus.OK,
        action: 'Entry',
        message: `Welcome, ${result.booking.name}!`,
        slotNumber: result.booking.slot.slot_number,
        checkInTime: result.booking.checkInTime
      };
    } else {
      return {
        statusCode: HttpStatus.OK,
        action: 'Exit',
        message: `Thank you, ${result.booking.name}! Come again.`,
        parkingDuration: this.calculateDuration(result.booking.checkInTime, result.booking.checkOutTime),
        checkOutTime: result.booking.checkOutTime
      };
    }
  }

  @Delete(':id')
  async cancel(@Param('id') id: string) {
    await this.bookingService.cancelBooking(+id);
    return { message: 'Booking cancelled successfully' };
  }

  @Post('maintenance/cleanup')
  @HttpCode(HttpStatus.OK)
  async cleanup() {
    await this.bookingService.cleanupExpiredBookings();
    return { message: 'Expired bookings cleanup complete' };
  }

  private calculateDuration(start: Date, end: Date): string {
    if (!start || !end) return 'Unknown';
    
    const diffMs = end.getTime() - start.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}m`;
  }
}
