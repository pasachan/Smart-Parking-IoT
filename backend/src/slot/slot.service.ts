// src/slot/slot.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In, Raw, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Slot } from './slot.entity';
import { SearchSlotsDto } from './dto/search-slots.dto';
import { Booking } from '../booking/booking.entity';

@Injectable()
export class SlotService {
  constructor(
    @InjectRepository(Slot)
    private slotRepository: Repository<Slot>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>
  ) {}

  async createSlot(slot_number: string): Promise<Slot> {
    const slot = this.slotRepository.create({ slot_number, is_occupied: false });
    return this.slotRepository.save(slot);
  }

  /**
   * Find a slot by its ID
   * @param id Slot ID
   * @returns Slot if found
   */
  async findById(id: number): Promise<Slot | undefined> {
    return this.slotRepository.findOne({ 
      where: { id },
      relations: ['bookings'] 
    });
  }

  /**
   * Update slot availability status
   * @param id Slot ID
   * @param isAvailable New availability status
   */
  async updateAvailability(id: number, isAvailable: boolean): Promise<void> {
    // For compatibility with your existing implementation 
    // which uses is_occupied instead of isAvailable
    await this.slotRepository.update(id, { is_occupied: !isAvailable });
  }

  async findBySlotNumber(slot_number: string): Promise<Slot | undefined> {
    return this.slotRepository.findOne({ where: { slot_number } });
  }

  async getAvailableSlots(): Promise<Slot[]> {
    return this.slotRepository.find({ where: { is_occupied: false } });
  }

  async setOccupied(slotId: number, occupied: boolean): Promise<void> {
    await this.slotRepository.update(slotId, { is_occupied: occupied });
  }

  async getAllSlots(): Promise<Slot[]> {
    return this.slotRepository.find();
  }

  /**
   * Search for available slots during a specific time period
   * @param searchDto Time period to search for
   * @returns Available slots
   */
  async searchAvailableSlots(searchDto: SearchSlotsDto): Promise<Slot[]> {
    const { startTime, endTime } = searchDto;
    
    // Parse dates
    const searchStart = new Date(startTime);
    const searchEnd = new Date(endTime);
    
    // Step 1: Find all slots that are not physically occupied
    // Important: We only filter by physical occupancy
    const allSlots = await this.slotRepository.find({
      where: { is_occupied: false }
    });
    
    if (allSlots.length === 0) {
      return [];
    }
    
    // Step 2: Find all conflicting bookings during this time period
    // A booking conflicts if:
    // - It's active or checked_in
    // - AND it has an overlap with our requested time period
    const conflictingBookings = await this.bookingRepository.find({
      where: [
        {
          status: 'active',
          // NOT (booking ends before or at our start OR booking starts after or at our end)
          // = There is an overlap
          startTime: LessThanOrEqual(searchEnd),
          endTime: MoreThanOrEqual(searchStart)
        },
        {
          status: 'checked_in',
          // For checked_in bookings, just check if they conflict
          endTime: MoreThanOrEqual(searchStart)
        }
      ]
    });
    
    // Get IDs of slots that have conflicting bookings
    const conflictingSlotIds = conflictingBookings.map(booking => booking.slotId);
    
    // Step 3: Filter out slots with conflicting bookings
    const availableSlots = allSlots.filter(slot => 
      !conflictingSlotIds.includes(slot.id)
    );
    
    return availableSlots;
  }
}
