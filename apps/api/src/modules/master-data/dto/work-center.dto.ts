import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, MaxLength } from 'class-validator';

export class CreateWorkCenterDto {
  @ApiProperty({ example: 'CNC-001', description: 'Work center name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'MACHINE', description: 'Work center type (MACHINE, LABOR, MIXED)' })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiProperty({ example: 100, description: 'Capacity per day' })
  @IsNumber()
  @IsNotEmpty()
  capacity!: number;

  @ApiPropertyOptional({ example: 0.85, description: 'OEE target (0-1)' })
  @IsOptional()
  @IsNumber()
  oeeTarget?: number;

  @ApiProperty({ example: 'uuid-company-id', description: 'Company ID' })
  @IsString()
  @IsNotEmpty()
  companyId!: string;

  @ApiProperty({ example: 'uuid-department-id', description: 'Department ID' })
  @IsString()
  @IsNotEmpty()
  departmentId!: string;
}

export class UpdateWorkCenterDto {
  @ApiPropertyOptional({ example: 'CNC-002', description: 'Work center name' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'LABOR', description: 'Work center type' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  type?: string;

  @ApiPropertyOptional({ example: 120, description: 'Capacity per day' })
  @IsOptional()
  @IsNumber()
  capacity?: number;

  @ApiPropertyOptional({ example: 0.9, description: 'OEE target (0-1)' })
  @IsOptional()
  @IsNumber()
  oeeTarget?: number;
}

export class WorkCenterQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  limit?: number = 20;

  @ApiPropertyOptional({ example: 'CNC', description: 'Search term' })
  search?: string;

  @ApiPropertyOptional({ example: 'MACHINE', description: 'Filter by type' })
  type?: string;

  @ApiPropertyOptional({ description: 'Company ID' })
  companyId?: string;

  @ApiPropertyOptional({ description: 'Department ID' })
  departmentId?: string;
}
