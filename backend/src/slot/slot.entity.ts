// src/slot/slot.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Booking } from '../booking/booking.entity';

/**
 * Entity representing a parking slot
 * Contains slot information and availability status
 */
@Entity('slots')
export class Slot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10 })
  slot_number: string;

  @Column({ default: false })
  is_occupied: boolean;

  @OneToMany(() => Booking, booking => booking.slot)
  bookings: Booking[];
}
