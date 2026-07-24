import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateRfqDto {
  @IsString()
  companyId!: string;

  @IsString()
  vendorId!: string;

  @IsDateString()
  dueDate!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRfqLineDto)
  lines!: CreateRfqLineDto[];
}

export class CreateRfqLineDto {
  @IsString()
  itemId!: string;

  @IsString()
  itemName!: string;

  @IsNumber()
  @Min(0.0001)
  qty!: number;

  @IsString()
  uom!: string;
}

export class UpdateRfqDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class QueryRfqDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  vendorId?: string;

  @IsOptional()
  @IsString()
  companyId?: string;
}
