import { IsEnum, IsNotEmpty } from 'class-validator';
import { BookStatus } from '@prisma/client';

export class UpdateBookStatusDto {
  @IsEnum(BookStatus, { message: 'Invalid book status' })
  @IsNotEmpty({ message: 'Status is required' })
  status: BookStatus;
}
