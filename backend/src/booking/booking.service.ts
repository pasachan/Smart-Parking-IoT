// src/booking/booking.service.ts
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Between } from 'typeorm';
import { Booking } from './booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { SlotService } from '../slot/slot.service';
import { MailerService } from '../mailer/mailer.service';

/**
 * Service for handling parking bookings
 * Manages the creation, retrieval, and status updates of bookings
 */
@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private slotService: SlotService,
    private mailerService: MailerService
  ) {}

  /**
   * Create a new parking booking
   * @param createBookingDto Booking creation data
   * @returns Newly created booking
   */
  async createBooking(createBookingDto: CreateBookingDto): Promise<Booking> {
    const { name, email, slotId, rfIdTagId, startTime, endTime } = createBookingDto;
    
    // Check if slot exists
    const slot = await this.slotService.findById(slotId);
    if (!slot) {
      throw new NotFoundException(`Slot with ID ${slotId} not found`);
    }

    // Check if slot is physically occupied (not just reserved)
    if (slot.is_occupied) {
      throw new BadRequestException(`Slot ${slotId} is physically occupied and not available for booking`);
    }

    // Parse dates for time comparison
    const bookingStart = new Date(startTime);
    const bookingEnd = new Date(endTime);
    
    // Validate booking times
    if (bookingStart >= bookingEnd) {
      throw new BadRequestException('Start time must be before end time');
    }
    
    if (bookingStart < new Date()) {
      throw new BadRequestException('Cannot book a slot in the past');
    }

    // Check for overlapping bookings
    const overlappingBookings = await this.bookingRepository.find({
      where: {
        slotId,
        status: 'active',
        startTime: LessThan(bookingEnd),
        endTime: MoreThan(bookingStart)
      },
    });

    if (overlappingBookings.length > 0) {
      throw new BadRequestException('Slot is already booked for the selected time period');
    }

    // Create new booking
    const booking = this.bookingRepository.create({
      name,
      email,
      slotId,
      rfIdTagId,
      startTime: bookingStart,
      endTime: bookingEnd,
      checkInTime: null,
      checkOutTime: null,
      status: 'active',
    });

    // Save booking to database
    const savedBooking = await this.bookingRepository.save(booking);
    
    // Send confirmation email
    await this.mailerService.sendBookingConfirmation(savedBooking, slot);
    console.log("mail")
    return savedBooking;
  }

  /**
   * Get a booking by its ID
   * @param id Booking ID
   * @returns Booking if found
   */
  async getBookingById(id: number): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({ 
      where: { id },
      relations: ['slot']
    });
    
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
    
    return booking;
  }

  /**
   * Get all bookings for a specific user email
   * @param email User email
   * @returns Array of user's bookings
   */
  async getBookingsByEmail(email: string): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { email },
      relations: ['slot'],
      order: { startTime: 'DESC' },
    });
  }

  /**
   * Get all currently active bookings
   * @returns Array of active bookings
   */
  async getActiveBookings(): Promise<Booking[]> {
    const currentDate = new Date();
    return this.bookingRepository.find({
      where: {
        endTime: MoreThan(currentDate),
        status: 'active',
      },
      relations: ['slot'],
      order: { startTime: 'ASC' },
    });
  }

  /**
   * Find active booking for a user by email
   * @param email User email
   * @returns Active booking if found
   */
  async findActiveBookingByEmail(email: string): Promise<Booking | null> {
    const currentDate = new Date();
    return this.bookingRepository.findOne({
      where: {
        email,
        status: 'active',
        endTime: MoreThan(currentDate),
      },
      relations: ['slot'],
    });
  }

  /**
   * Find a booking by RFID tag ID - updated to include checked_in status
   * @param rfIdTagId RFID tag ID
   * @returns Active or checked_in booking if found
   */
  async findBookingByRfIdTag(rfIdTagId: string): Promise<Booking | undefined> {
    const currentDate = new Date();
    return this.bookingRepository.findOne({ 
      where: [
        { 
          rfIdTagId,
          status: 'active',
          startTime: LessThan(currentDate),
          endTime: MoreThan(currentDate)
        },
        {
          rfIdTagId,
          status: 'checked_in',
        }
      ],
      relations: ['slot']
    });
  }

  /**
   * Get all bookings in the system
   * @returns Array of all bookings
   */
  async getAllBookings(): Promise<Booking[]> {
    return this.bookingRepository.find({ 
      relations: ['slot'],
      order: { startTime: 'DESC' }
    });
  }

  /**
   * Mark a booking as completed
   * @param id Booking ID
   */
  async completeBooking(id: number): Promise<void> {
    const booking = await this.getBookingById(id);
    await this.bookingRepository.update(id, { 
      status: 'completed',
      checkOutTime: new Date()
    });
    
    // Make the slot available again
    await this.slotService.setOccupied(booking.slotId, false);
  }

  /**
   * Cancel a booking
   * @param id Booking ID
   */
  async cancelBooking(id: number): Promise<void> {
    const booking = await this.getBookingById(id);
    await this.bookingRepository.update(id, { status: 'cancelled' });
    
    // Make the slot available again
    await this.slotService.setOccupied(booking.slotId, false);
  }

  /**
   * Check in a booking (mark as checked_in when entering)
   * @param id Booking ID
   */
  async checkInBooking(id: number): Promise<void> {
    const booking = await this.getBookingById(id);
    
    if (booking.status !== 'active') {
      throw new BadRequestException(`Cannot check in booking with status ${booking.status}`);
    }
    
    // Verify booking is within valid time
    const currentTime = new Date();
    if (currentTime < booking.startTime) {
      throw new BadRequestException('Cannot check in before booking start time');
    }
    
    await this.bookingRepository.update(id, { 
      status: 'checked_in',
      checkInTime: currentTime
    });
    
    // Mark slot as occupied
    await this.slotService.setOccupied(booking.slotId, true);
  }

  /**
   * Scan RFID for entry/exit and handle state transitions
   * @param rfIdTagId RFID tag ID
   * @returns Updated booking with action taken
   */
  async handleRfidScan(rfIdTagId: string): Promise<{ booking: Booking, action: 'checked_in' | 'completed' }> {
    const booking = await this.findBookingByRfIdTag(rfIdTagId);
    
    if (!booking) {
      throw new NotFoundException(`No active booking found for RFID tag ${rfIdTagId}`);
    }
    
    // Check booking state and transition appropriately
    if (booking.status === 'active') {
      // First scan - Check in
      await this.checkInBooking(booking.id);
      return { 
        booking: await this.getBookingById(booking.id),
        action: 'checked_in'
      };
    } else if (booking.status === 'checked_in') {
      // Second scan - Check out
      await this.completeBooking(booking.id);
      return { 
        booking: await this.getBookingById(booking.id),
        action: 'completed'
      };
    } else {
      throw new ConflictException(`Booking is already in ${booking.status} state`);
    }
  }

  /**
   * Clean up expired bookings (maintenance task)
   * Automatically marks expired active bookings as completed
   */
  async cleanupExpiredBookings(): Promise<void> {
    const currentDate = new Date();
    const expiredBookings = await this.bookingRepository.find({
      where: {
        endTime: LessThan(currentDate), 
        status: 'active'
      }
    });
    
    for (const booking of expiredBookings) {
      await this.completeBooking(booking.id);
    }
  }
}
