import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAssetDto {
  @ApiProperty({ description: 'Factory ID' })
  @IsString()
  @IsNotEmpty()
  factoryId!: string;

  @ApiProperty({ example: 'CNC Machine #3', description: 'Asset name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'MACHINE', description: 'Asset type' })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiProperty({ example: 'HIGH', description: 'Criticality level' })
  @IsString()
  @IsNotEmpty()
  criticality!: string;
}

export class UpdateAssetDto {
  @ApiPropertyOptional({ example: 'CNC Machine #3', description: 'Asset name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'MACHINE', description: 'Asset type' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: 'HIGH', description: 'Criticality level' })
  @IsOptional()
  @IsString()
  criticality?: string;
}

export class AssetQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Filter by factory ID' })
  factoryId?: string;

  @ApiPropertyOptional({ description: 'Filter by type' })
  type?: string;

  @ApiPropertyOptional({ description: 'Filter by criticality' })
  criticality?: string;
}

export class CreateWoTaskDto {
  @ApiProperty({ example: 1, description: 'Task sequence number' })
  @IsNumber()
  @Min(1)
  seq!: number;

  @ApiProperty({ example: 'Lubricate bearings', description: 'Task description' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: 2.5, description: 'Estimated hours' })
  @IsNumber()
  @Min(0)
  estimatedHours!: number;

  @ApiPropertyOptional({ example: 2.0, description: 'Actual hours' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  actualHours?: number;

  @ApiPropertyOptional({ description: 'Completion timestamp' })
  @IsOptional()
  completedAt?: string;

  @ApiPropertyOptional({ description: 'Completed by user ID' })
  @IsOptional()
  @IsString()
  completedBy?: string;
}

export class CreateWorkOrderDto {
  @ApiProperty({ description: 'Asset ID' })
  @IsString()
  @IsNotEmpty()
  assetId!: string;

  @ApiProperty({ example: 'CORRECTIVE', description: 'Work order type' })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiProperty({ example: 'HIGH', description: 'Priority level' })
  @IsString()
  @IsNotEmpty()
  priority!: string;

  @ApiPropertyOptional({ description: 'Assigned user ID' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'Due date' })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiPropertyOptional({ type: [CreateWoTaskDto], description: 'Work order tasks' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWoTaskDto)
  tasks?: CreateWoTaskDto[];
}

export class UpdateWorkOrderDto {
  @ApiPropertyOptional({ description: 'Work order type' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Priority level' })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiPropertyOptional({ description: 'Work order status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Assigned user ID' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'Due date' })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Completion timestamp' })
  @IsOptional()
  completedAt?: string;
}

export class WorkOrderQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Filter by asset ID' })
  assetId?: string;

  @ApiPropertyOptional({ description: 'Filter by status' })
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by assigned user' })
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'Filter by type' })
  type?: string;
}

export class UpdateWoTaskDto {
  @ApiPropertyOptional({ example: 2.0, description: 'Actual hours' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  actualHours?: number;

  @ApiPropertyOptional({ description: 'Completion timestamp' })
  @IsOptional()
  completedAt?: string;

  @ApiPropertyOptional({ description: 'Completed by user ID' })
  @IsOptional()
  @IsString()
  completedBy?: string;
}

export class CreatePmScheduleDto {
  @ApiProperty({ description: 'Asset ID' })
  @IsString()
  @IsNotEmpty()
  assetId!: string;

  @ApiProperty({ example: 'WEEKLY', description: 'Maintenance frequency' })
  @IsString()
  @IsNotEmpty()
  frequency!: string;

  @ApiProperty({ description: 'Next scheduled run date' })
  @IsString()
  @IsNotEmpty()
  nextRun!: string;

  @ApiPropertyOptional({ description: 'Last run date' })
  @IsOptional()
  lastRun?: string;

  @ApiPropertyOptional({ description: 'Tasks configuration (JSON)' })
  @IsOptional()
  tasks?: Record<string, unknown>;
}

export class UpdatePmScheduleDto {
  @ApiPropertyOptional({ example: 'WEEKLY', description: 'Maintenance frequency' })
  @IsOptional()
  @IsString()
  frequency?: string;

  @ApiPropertyOptional({ description: 'Next scheduled run date' })
  @IsOptional()
  @IsString()
  nextRun?: string;

  @ApiPropertyOptional({ description: 'Last run date' })
  @IsOptional()
  lastRun?: string;

  @ApiPropertyOptional({ description: 'Tasks configuration (JSON)' })
  @IsOptional()
  tasks?: Record<string, unknown>;
}

export class PmScheduleQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Filter by frequency' })
  frequency?: string;

  @ApiPropertyOptional({ description: 'Asset ID' })
  assetId?: string;
}
