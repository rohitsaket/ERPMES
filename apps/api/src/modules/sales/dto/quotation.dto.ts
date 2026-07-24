import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuotationLineDto {
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

  @ApiPropertyOptional({ example: 5, description: 'Discount percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPct?: number;
}

export class CreateQuotationDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @ApiProperty({ description: 'Company ID' })
  @IsString()
  @IsNotEmpty()
  companyId!: string;

  @ApiPropertyOptional({ description: 'Validity date' })
  @IsOptional()
  @IsString()
  validUntil?: string;

  @ApiProperty({ type: [CreateQuotationLineDto], description: 'Quotation lines' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuotationLineDto)
  lines!: CreateQuotationLineDto[];
}

export class UpdateQuotationDto {
  @ApiPropertyOptional({ description: 'Customer ID' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Validity date' })
  @IsOptional()
  @IsString()
  validUntil?: string;

  @ApiPropertyOptional({ type: [CreateQuotationLineDto], description: 'Quotation lines' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuotationLineDto)
  lines?: CreateQuotationLineDto[];
}

export class QuotationQueryDto {
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
