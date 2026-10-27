import { IsEnum, IsNotEmpty } from 'class-validator';
import { BorrowStatus } from '@prisma/client';

export class UpdateBorrowStatusDto {
  @IsEnum(BorrowStatus, { message: 'Invalid borrow status' })
  @IsNotEmpty({ message: 'Status is required' })
  status: BorrowStatus;
}
