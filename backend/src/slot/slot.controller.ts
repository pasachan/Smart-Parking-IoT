import { Controller, Get, Post, Patch, Param, Body, HttpStatus, HttpCode, BadRequestException, NotFoundException } from '@nestjs/common';
import { SlotService } from './slot.service';
import { SearchSlotsDto } from './dto/search-slots.dto';

/**
 * Controller for handling parking slot HTTP requests
 * Provides endpoints for slot management and status updates
 */
@Controller('slots')
export class SlotController {
  constructor(private readonly slotService: SlotService) {}

  /**
   * Create a new parking slot
   * POST /slots
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createSlotDto: { slot_number: string }) {
    if (!createSlotDto.slot_number) {
      throw new BadRequestException('Slot number is required');
    }
    return this.slotService.createSlot(createSlotDto.slot_number);
  }

  /**
   * Get all parking slots
   * GET /slots
   */
  @Get()
  findAll() {
    return this.slotService.getAllSlots();
  }

  /**
   * Get all available parking slots
   * GET /slots/available
   */
  @Get('available')
  getAvailable() {
    return this.slotService.getAvailableSlots();
  }

  /**
   * Get a specific parking slot by ID
   * GET /slots/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    const slotId = Number(id);
    if (isNaN(slotId)) {
      throw new BadRequestException('Slot ID must be a number');
    }
    return this.slotService.findById(slotId);
  }

  /**
   * Set slot occupancy status
   * PATCH /slots/:id/occupy
   */
  @Patch(':id/occupy')
  setOccupied(@Param('id') id: string, @Body() data: { occupied: boolean }) {
    const slotId = Number(id);
    if (isNaN(slotId)) {
      throw new BadRequestException('Slot ID must be a number');
    }
    
    if (typeof data.occupied !== 'boolean') {
      throw new BadRequestException('Occupied status must be a boolean value');
    }
    
    return this.slotService.setOccupied(slotId, data.occupied);
  }

  /**
   * Search for available slots by time period
   * POST /slots/search
   */
  @Post('search')
  async searchAvailableSlots(@Body() searchDto: SearchSlotsDto) {
    // Validate input dates
    try {
      const startDate = new Date(searchDto.startTime);
      const endDate = new Date(searchDto.endTime);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestException('Invalid date format');
      }
    } catch (error) {
      throw new BadRequestException('Invalid date format');
    }
    
    return this.slotService.searchAvailableSlots(searchDto);
  }
}
