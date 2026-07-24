import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class AnalyticsQueryDto {
  @ApiPropertyOptional({ description: 'Factory ID' })
  @IsOptional()
  @IsString()
  factoryId?: string;

  @ApiPropertyOptional({ description: 'Start date (ISO string)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'End date (ISO string)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Department ID' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Work center ID' })
  @IsOptional()
  @IsString()
  workCenterId?: string;
}

export class CustomReportDto {
  @ApiProperty({ description: 'Report name' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Report description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Report query configuration (JSON)' })
  queryConfig!: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Report schedule (cron expression)' })
  @IsOptional()
  @IsString()
  schedule?: string;
}

export class CustomReportQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  @IsOptional()
  limit?: number = 20;
}