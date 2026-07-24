import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsObject, MaxLength } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Acme Corporation', description: 'Company name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'ACME', description: 'Unique company code (uppercase, alphanumeric)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  code!: string;

  @ApiPropertyOptional({ description: 'Company settings', example: { currency: 'USD', timezone: 'UTC' } })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

export class UpdateCompanyDto {
  @ApiPropertyOptional({ example: 'Acme Corporation Updated', description: 'Company name' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Company settings', example: { currency: 'EUR', timezone: 'Europe/Paris' } })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

export class CompanyQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  limit?: number = 20;

  @ApiPropertyOptional({ example: 'Acme', description: 'Search term' })
  search?: string;
}
