import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BookStatus } from '@prisma/client';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsOptional()
  @IsString()
  isbn?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageCount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1000)
  publishedYear?: number;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockQuantity?: number;

  @IsString()
  @IsNotEmpty({ message: 'Category ID is required' })
  categoryId: string;

  @IsOptional()
  @IsEnum(BookStatus)
  status?: BookStatus;
}
