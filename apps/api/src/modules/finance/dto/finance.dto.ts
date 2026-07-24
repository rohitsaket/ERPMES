import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAccountDto {
  @ApiProperty({ description: 'Company ID' })
  @IsString()
  @IsNotEmpty()
  companyId!: string;

  @ApiProperty({ example: '1000', description: 'Account code (unique per company)' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 'Cash', description: 'Account name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'ASSET', description: 'Account type' })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiPropertyOptional({ description: 'Parent account ID' })
  @IsOptional()
  @IsString()
  parentId?: string;
}

export class UpdateAccountDto {
  @ApiPropertyOptional({ example: 'Cash', description: 'Account name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'ASSET', description: 'Account type' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Parent account ID' })
  @IsOptional()
  @IsString()
  parentId?: string;
}

export class AccountQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  page?: number = 1;

  @ApiPropertyOptional({ example: 50, description: 'Items per page' })
  limit?: number = 50;

  @ApiPropertyOptional({ description: 'Company ID' })
  companyId?: string;

  @ApiPropertyOptional({ description: 'Filter by type' })
  type?: string;
}

export class CreateInvoiceLineDto {
  @ApiProperty({ description: 'Line description' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: 1, description: 'Quantity' })
  @IsNumber()
  @Min(0.000001)
  qty!: number;

  @ApiProperty({ example: 1000, description: 'Unit price' })
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @ApiProperty({ description: 'Account ID' })
  @IsString()
  @IsNotEmpty()
  accountId!: string;
}

export class CreateInvoiceDto {
  @ApiProperty({ description: 'Company ID' })
  @IsString()
  @IsNotEmpty()
  companyId!: string;

  @ApiProperty({ description: 'Customer ID' })
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @ApiPropertyOptional({ description: 'Shipment ID' })
  @IsOptional()
  @IsString()
  shipmentId?: string;

  @ApiProperty({ example: 'USD', description: 'Currency' })
  @IsString()
  @IsNotEmpty()
  currency!: string;

  @ApiProperty({ description: 'Due date' })
  @IsString()
  @IsNotEmpty()
  dueDate!: string;

  @ApiProperty({ type: [CreateInvoiceLineDto], description: 'Invoice lines' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceLineDto)
  lines!: CreateInvoiceLineDto[];
}

export class UpdateInvoiceDto {
  @ApiPropertyOptional({ description: 'Invoice status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Currency' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Due date' })
  @IsOptional()
  @IsString()
  dueDate?: string;
}

export class InvoiceQueryDto {
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

export class CreatePaymentDto {
  @ApiProperty({ description: 'Invoice ID' })
  @IsString()
  @IsNotEmpty()
  invoiceId!: string;

  @ApiProperty({ example: 5000, description: 'Payment amount' })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiPropertyOptional({ example: 'USD', description: 'Currency' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: 'WIRE_TRANSFER', description: 'Payment method' })
  @IsString()
  @IsNotEmpty()
  method!: string;

  @ApiPropertyOptional({ description: 'Payment reference' })
  @IsOptional()
  @IsString()
  reference?: string;
}

export class PaymentQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Invoice ID' })
  invoiceId?: string;

  @ApiPropertyOptional({ description: 'Payment method' })
  method?: string;
}

export class CreateJournalLineDto {
  @ApiProperty({ description: 'Account ID' })
  @IsString()
  @IsNotEmpty()
  accountId!: string;

  @ApiProperty({ example: 1000, description: 'Debit amount' })
  @IsNumber()
  @Min(0)
  debit!: number;

  @ApiProperty({ example: 0, description: 'Credit amount' })
  @IsNumber()
  @Min(0)
  credit!: number;

  @ApiPropertyOptional({ description: 'Line description' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateJournalEntryDto {
  @ApiProperty({ description: 'Company ID' })
  @IsString()
  @IsNotEmpty()
  companyId!: string;

  @ApiProperty({ description: 'Journal date' })
  @IsString()
  @IsNotEmpty()
  date!: string;

  @ApiProperty({ example: 'Monthly accrual', description: 'Journal memo' })
  @IsString()
  @IsNotEmpty()
  memo!: string;

  @ApiProperty({ type: [CreateJournalLineDto], description: 'Journal lines' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateJournalLineDto)
  lines!: CreateJournalLineDto[];
}

export class JournalEntryQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Company ID' })
  companyId?: string;

  @ApiPropertyOptional({ description: 'Start date filter' })
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'End date filter' })
  dateTo?: string;
}
