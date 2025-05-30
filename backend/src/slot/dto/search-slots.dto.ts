import { IsDateString, IsOptional, IsString } from 'class-validator';

/**
 * Data Transfer Object for searching available slots by time
 */
export class SearchSlotsDto {
  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsString()
  @IsOptional()
  location?: string; // Optional location filter
}
