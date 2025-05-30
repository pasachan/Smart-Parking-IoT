// src/booking/booking.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Slot } from '../slot/slot.entity';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  slotId: number;

  @Column()
  rfIdTagId: string; // RFID UID

  @ManyToOne(() => Slot)
  @JoinColumn({ name: 'slotId' })
  slot: Slot;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  checkInTime: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  checkOutTime: Date | null;

  @Column({ default: 'active' })
  status: 'active' | 'checked_in' | 'completed' | 'cancelled';

  @CreateDateColumn()
  createdAt: Date;
}
