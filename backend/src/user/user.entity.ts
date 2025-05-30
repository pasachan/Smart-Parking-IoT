// src/user/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { Booking } from '../booking/booking.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ unique: true, length: 50 })
  uid: string; // RFID UID

  @CreateDateColumn()
  created_at: Date;
}
