import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'ACME-RING-001', description: 'Unique SKU' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  sku!: string;

  @ApiProperty({ example: 'Solitaire Diamond Ring 0.5ct', description: 'Product name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiProperty({ example: 'RINGS', description: 'Product category' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  category!: string;

  @ApiPropertyOptional({ example: 'Classic solitaire ring with round diamond', description: 'Product description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'uuid-company-id', description: 'Company ID' })
  @IsString()
  @IsNotEmpty()
  companyId!: string;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'ACME-RING-002', description: 'Unique SKU' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  sku?: string;

  @ApiPropertyOptional({ example: 'Updated Solitaire Diamond Ring', description: 'Product name' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'EARRINGS', description: 'Product category' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  category?: string;

  @ApiPropertyOptional({ description: 'Product description' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class ProductQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  limit?: number = 20;

  @ApiPropertyOptional({ example: 'ring', description: 'Search term' })
  search?: string;

  @ApiPropertyOptional({ example: 'RINGS', description: 'Filter by category' })
  category?: string;

  @ApiPropertyOptional({ description: 'Company ID' })
  companyId?: string;
}
