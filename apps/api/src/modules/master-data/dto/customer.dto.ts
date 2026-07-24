import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'John Doe Jewelry Store', description: 'Customer name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiProperty({ example: 'JOHN-DOE', description: 'Unique customer code' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code!: string;

  @ApiPropertyOptional({ example: 50000, description: 'Credit limit' })
  @IsOptional()
  @IsNumber()
  creditLimit?: number;

  @ApiPropertyOptional({ example: 'NET30', description: 'Payment terms' })
  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @ApiPropertyOptional({ description: 'Address information as JSON' })
  @IsOptional()
  @IsObject()
  address?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Contact information as JSON' })
  @IsOptional()
  @IsObject()
  contactInfo?: Record<string, any>;

  @ApiProperty({ example: 'uuid-company-id', description: 'Company ID' })
  @IsString()
  @IsNotEmpty()
  companyId!: string;
}

export class UpdateCustomerDto {
  @ApiPropertyOptional({ example: 'John Doe Jewelry Store Updated', description: 'Customer name' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'JOHN-DOE-2', description: 'Unique customer code' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code?: string;

  @ApiPropertyOptional({ example: 75000, description: 'Credit limit' })
  @IsOptional()
  @IsNumber()
  creditLimit?: number;

  @ApiPropertyOptional({ example: 'NET60', description: 'Payment terms' })
  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @ApiPropertyOptional({ description: 'Address information as JSON' })
  @IsOptional()
  @IsObject()
  address?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Contact information as JSON' })
  @IsOptional()
  @IsObject()
  contactInfo?: Record<string, any>;
}

export class CustomerQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ example: 'John', description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Company ID' })
  @IsOptional()
  @IsString()
  companyId?: string;
}
