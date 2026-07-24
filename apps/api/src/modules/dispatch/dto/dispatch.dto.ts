import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateBagDto {
  @ApiPropertyOptional({ description: 'Shipment ID' })
  @IsOptional()
  @IsString()
  shipmentId?: string;

  @ApiProperty({ example: 10.5, description: 'Weight' })
  @IsNumber()
  @Min(0)
  weight!: number;

  @ApiProperty({ example: 'SEAL-001', description: 'Seal number (unique)' })
  @IsString()
  @IsNotEmpty()
  sealNo!: string;

  @ApiPropertyOptional({ example: 'ACTIVE', description: 'Bag status' })
  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateBagDto {
  @ApiPropertyOptional({ description: 'Shipment ID' })
  @IsOptional()
  @IsString()
  shipmentId?: string;

  @ApiPropertyOptional({ example: 10.5, description: 'Weight' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ description: 'Bag status' })
  @IsOptional()
  @IsString()
  status?: string;
}

export class BagQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Filter by status' })
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by shipment ID' })
  shipmentId?: string;
}

export class CreateShipmentDto {
  @ApiProperty({ description: 'Company ID' })
  @IsString()
  @IsNotEmpty()
  companyId!: string;

  @ApiProperty({ description: 'Customer ID' })
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @ApiPropertyOptional({ description: 'Carrier ID' })
  @IsOptional()
  @IsString()
  carrierId?: string;

  @ApiPropertyOptional({ description: 'Tracking number' })
  @IsOptional()
  @IsString()
  trackingNo?: string;
}

export class UpdateShipmentDto {
  @ApiPropertyOptional({ description: 'Customer ID' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Carrier ID' })
  @IsOptional()
  @IsString()
  carrierId?: string;

  @ApiPropertyOptional({ description: 'Tracking number' })
  @IsOptional()
  @IsString()
  trackingNo?: string;

  @ApiPropertyOptional({ description: 'Shipment status' })
  @IsOptional()
  @IsString()
  status?: string;
}

export class ShipmentQueryDto {
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

export class CreateCarrierDto {
  @ApiProperty({ example: 'FedEx', description: 'Carrier name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'FEDEX', description: 'Carrier code (unique)' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional({ description: 'API endpoint URL' })
  @IsOptional()
  @IsString()
  apiEndpoint?: string;

  @ApiPropertyOptional({ description: 'API key' })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiPropertyOptional({ description: 'Account number' })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiPropertyOptional({ description: 'Service levels configuration' })
  @IsOptional()
  serviceLevels?: Record<string, unknown>;
}

export class UpdateCarrierDto {
  @ApiPropertyOptional({ description: 'Carrier name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'API endpoint URL' })
  @IsOptional()
  @IsString()
  apiEndpoint?: string;

  @ApiPropertyOptional({ description: 'API key' })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiPropertyOptional({ description: 'Account number' })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiPropertyOptional({ description: 'Service levels configuration' })
  @IsOptional()
  serviceLevels?: Record<string, unknown>;
}

export class CarrierQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  limit?: number = 20;
}
