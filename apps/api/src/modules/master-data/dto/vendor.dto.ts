import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsObject, MaxLength } from 'class-validator';

export class CreateVendorDto {
  @ApiProperty({ example: 'Diamond World Ltd.', description: 'Vendor name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiProperty({ example: 'DW-LTD', description: 'Unique vendor code' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code!: string;

  @ApiPropertyOptional({ description: 'Contact information as JSON' })
  @IsOptional()
  @IsObject()
  contactInfo?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Address information as JSON' })
  @IsOptional()
  @IsObject()
  address?: Record<string, any>;

  @ApiPropertyOptional({ example: 4.5, description: 'Vendor rating (0-5)' })
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiProperty({ example: 'uuid-company-id', description: 'Company ID' })
  @IsString()
  @IsNotEmpty()
  companyId!: string;
}

export class UpdateVendorDto {
  @ApiPropertyOptional({ example: 'Diamond World Ltd. Updated', description: 'Vendor name' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'DW-LTD-2', description: 'Unique vendor code' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code?: string;

  @ApiPropertyOptional({ description: 'Contact information as JSON' })
  @IsOptional()
  @IsObject()
  contactInfo?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Address information as JSON' })
  @IsOptional()
  @IsObject()
  address?: Record<string, any>;

  @ApiPropertyOptional({ example: 4.8, description: 'Vendor rating (0-5)' })
  @IsOptional()
  @IsNumber()
  rating?: number;
}

export class VendorQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  limit?: number = 20;

  @ApiPropertyOptional({ example: 'Diamond', description: 'Search term' })
  search?: string;

  @ApiPropertyOptional({ description: 'Company ID' })
  companyId?: string;
}
