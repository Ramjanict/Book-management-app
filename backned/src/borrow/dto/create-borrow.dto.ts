import { IsDateString, IsOptional } from 'class-validator';

export class CreateBorrowDto {
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
