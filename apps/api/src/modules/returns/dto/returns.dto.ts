import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRaLineDto {
  @ApiPropertyOptional({ description: 'Diamond ID' })
  @IsOptional()
  @IsString()
  diamondId?: string;

  @ApiProperty({ example: 1, description: 'Quantity' })
  @IsNumber()
  @Min(0.000001)
  qty!: number;

  @ApiProperty({ example: 'DEFECT', description: 'Return reason' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export class CreateReturnAuthDto {
  @ApiProperty({ description: 'Company ID' })
  @IsString()
  @IsNotEmpty()
  companyId!: string;

  @ApiProperty({ description: 'Customer ID' })
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @ApiPropertyOptional({ description: 'Invoice ID' })
  @IsOptional()
  @IsString()
  invoiceId?: string;

  @ApiProperty({ type: [CreateRaLineDto], description: 'Return lines' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRaLineDto)
  lines!: CreateRaLineDto[];
}

export class UpdateReturnAuthDto {
  @ApiPropertyOptional({ description: 'Status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Disposition' })
  @IsOptional()
  @IsString()
  disposition?: string;
}

export class ReturnAuthQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Filter by status' })
  status?: string;

  @ApiPropertyOptional({ description: 'Company ID' })
  companyId?: string;

  @ApiPropertyOptional({ description: 'Customer ID' })
  customerId?: string;
}

export class CreateRepairOrderDto {
  @ApiProperty({ description: 'Return authorization ID' })
  @IsString()
  @IsNotEmpty()
  returnAuthId!: string;

  @ApiPropertyOptional({ description: 'Production order ID for repair work' })
  @IsOptional()
  @IsString()
  productionOrderId?: string;
}

export class UpdateRepairOrderDto {
  @ApiPropertyOptional({ description: 'Status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Completion timestamp' })
  @IsOptional()
  completedAt?: string;
}

export class RepairOrderQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Filter by status' })
  status?: string;
}

export class CreateRedispatchDto {
  @ApiProperty({ description: 'Shipment ID for redispatch' })
  @IsString()
  @IsNotEmpty()
  shipmentId!: string;
}