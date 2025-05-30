import { IsString, IsEmail, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  rfIdTagId: string;

  @IsNumber()
  slotId: number;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;
}
