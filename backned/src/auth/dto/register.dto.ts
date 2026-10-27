import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum RegisterRole {
  USER = 'USER',
  AUTHOR = 'AUTHOR',
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(100)
  password!: string;

  @IsOptional()
  @IsEnum(RegisterRole)
  role?: RegisterRole;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  penName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  website?: string;
}
