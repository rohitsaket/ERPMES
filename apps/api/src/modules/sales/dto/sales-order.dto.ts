import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSalesOrderLineDto {
  @ApiProperty({ description: 'Product ID' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: 10, description: 'Quantity' })
  @IsNumber()
  @Min(0.000001)
  qty!: number;

  @ApiProperty({ example: 'PCS', description: 'Unit of measure' })
  @IsString()
  @IsNotEmpty()
  uom!: string;

  @ApiProperty({ example: 1500.50, description: 'Unit price' })
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @ApiPropertyOptional({ description: 'Due date' })
  @IsOptional()
  @IsString()
  dueDate?: string;
}

export class CreateSalesOrderDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @ApiProperty({ description: 'Company ID' })
  @IsString()
  @IsNotEmpty()
  companyId!: string;

  @ApiPropertyOptional({ description: 'Quotation ID (if converting from quotation)' })
  @IsOptional()
  @IsString()
  quotationId?: string;

  @ApiPropertyOptional({ description: 'Required date' })
  @IsOptional()
  @IsString()
  requiredDate?: string;

  @ApiProperty({ type: [CreateSalesOrderLineDto], description: 'Order lines' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSalesOrderLineDto)
  lines!: CreateSalesOrderLineDto[];
}

export class UpdateSalesOrderDto {
  @ApiPropertyOptional({ description: 'Customer ID' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Required date' })
  @IsOptional()
  @IsString()
  requiredDate?: string;

  @ApiPropertyOptional({ type: [CreateSalesOrderLineDto], description: 'Order lines' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSalesOrderLineDto)
  lines?: CreateSalesOrderLineDto[];
}

export class SalesOrderQueryDto {
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
