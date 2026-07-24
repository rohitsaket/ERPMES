import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInspectionStepDto {
  @ApiProperty({ example: 1, description: 'Step sequence number' })
  @IsNumber()
  @Min(1)
  seq!: number;

  @ApiProperty({ example: 'Visual Inspection', description: 'Step name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'VISUAL', description: 'Inspection type' })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiPropertyOptional({ example: 0.5, description: 'Minimum specification value' })
  @IsOptional()
  @IsNumber()
  specMin?: number;

  @ApiPropertyOptional({ example: 1.0, description: 'Maximum specification value' })
  @IsOptional()
  @IsNumber()
  specMax?: number;

  @ApiPropertyOptional({ example: 'CT', description: 'Unit of measure' })
  @IsOptional()
  @IsString()
  uom?: string;

  @ApiPropertyOptional({ example: 'Visual inspection under 10x loupe', description: 'Inspection method' })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional({ description: 'Sampling plan configuration' })
  @IsOptional()
  samplingPlan?: Record<string, unknown>;
}

export class CreateInspectionPlanDto {
  @ApiProperty({ description: 'Company ID' })
  @IsString()
  @IsNotEmpty()
  companyId!: string;

  @ApiProperty({ description: 'Product ID' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiPropertyOptional({ example: 1, description: 'Plan version' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  version?: number;

  @ApiPropertyOptional({ example: 'ACTIVE', description: 'Plan status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ type: [CreateInspectionStepDto], description: 'Inspection steps' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInspectionStepDto)
  steps!: CreateInspectionStepDto[];
}

export class UpdateInspectionPlanDto {
  @ApiPropertyOptional({ description: 'Plan status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ type: [CreateInspectionStepDto], description: 'Inspection steps' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInspectionStepDto)
  steps?: CreateInspectionStepDto[];
}

export class InspectionPlanQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Filter by status' })
  status?: string;

  @ApiPropertyOptional({ description: 'Company ID' })
  companyId?: string;

  @ApiPropertyOptional({ description: 'Product ID' })
  productId?: string;
}

export class CreateInspectionDto {
  @ApiProperty({ description: 'Production order ID' })
  @IsString()
  @IsNotEmpty()
  productionOrderId!: string;

  @ApiProperty({ description: 'Inspection step ID' })
  @IsString()
  @IsNotEmpty()
  stepId!: string;

  @ApiPropertyOptional({ description: 'Operation ID' })
  @IsOptional()
  @IsString()
  operationId?: string;

  @ApiProperty({ example: 'PENDING', description: 'Inspection status' })
  @IsString()
  @IsNotEmpty()
  status!: string;

  @ApiPropertyOptional({ example: 0.75, description: 'Measured value' })
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiPropertyOptional({ example: 'PASS', description: 'Inspection result' })
  @IsOptional()
  @IsString()
  result?: string;

  @ApiProperty({ description: 'Inspector user ID' })
  @IsString()
  @IsNotEmpty()
  inspectorId!: string;
}

export class UpdateInspectionDto {
  @ApiPropertyOptional({ description: 'Inspection status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 0.75, description: 'Measured value' })
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiPropertyOptional({ example: 'PASS', description: 'Inspection result' })
  @IsOptional()
  @IsString()
  result?: string;

  @ApiPropertyOptional({ description: 'NCR ID for linked nonconformance' })
  @IsOptional()
  @IsString()
  ncrId?: string;

  @ApiPropertyOptional({ description: 'Inspection images' })
  @IsOptional()
  images?: Record<string, unknown>;
}

export class InspectionQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Filter by status' })
  status?: string;

  @ApiPropertyOptional({ description: 'Production order ID' })
  productionOrderId?: string;

  @ApiPropertyOptional({ description: 'Inspector ID' })
  inspectorId?: string;
}

export class CreateNcrDto {
  @ApiProperty({ description: 'Inspection ID' })
  @IsString()
  @IsNotEmpty()
  inspectionId!: string;

  @ApiProperty({ example: 'DIMENSION', description: 'Nonconformance type' })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiProperty({ example: 'MAJOR', description: 'Severity level' })
  @IsString()
  @IsNotEmpty()
  severity!: string;

  @ApiPropertyOptional({ example: 'SCRAP', description: 'Disposition' })
  @IsOptional()
  @IsString()
  disposition?: string;

  @ApiPropertyOptional({ description: 'Root cause analysis' })
  @IsOptional()
  @IsString()
  rootCause?: string;

  @ApiPropertyOptional({ description: 'Corrective action' })
  @IsOptional()
  @IsString()
  correctiveAction?: string;

  @ApiProperty({ example: 'OPEN', description: 'NCR status' })
  @IsString()
  @IsNotEmpty()
  status!: string;
}

export class UpdateNcrDto {
  @ApiPropertyOptional({ description: 'Nonconformance type' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Severity level' })
  @IsOptional()
  @IsString()
  severity?: string;

  @ApiPropertyOptional({ description: 'Disposition' })
  @IsOptional()
  @IsString()
  disposition?: string;

  @ApiPropertyOptional({ description: 'Root cause analysis' })
  @IsOptional()
  @IsString()
  rootCause?: string;

  @ApiPropertyOptional({ description: 'Corrective action' })
  @IsOptional()
  @IsString()
  correctiveAction?: string;

  @ApiPropertyOptional({ description: 'NCR status' })
  @IsOptional()
  @IsString()
  status?: string;
}

export class NcrQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Filter by status' })
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by disposition' })
  disposition?: string;

  @ApiPropertyOptional({ description: 'Inspection ID' })
  inspectionId?: string;
}

export class CreateCapaDto {
  @ApiProperty({ description: 'NCR ID' })
  @IsString()
  @IsNotEmpty()
  ncrId!: string;

  @ApiProperty({ description: 'Corrective action description' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ description: 'Owner user ID' })
  @IsString()
  @IsNotEmpty()
  ownerId!: string;

  @ApiProperty({ description: 'Due date' })
  @IsString()
  @IsNotEmpty()
  dueDate!: string;

  @ApiPropertyOptional({ description: 'Effectiveness rating' })
  @IsOptional()
  @IsString()
  effectiveness?: string;
}

export class UpdateCapaDto {
  @ApiPropertyOptional({ description: 'Corrective action description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Owner user ID' })
  @IsOptional()
  @IsString()
  ownerId?: string;

  @ApiPropertyOptional({ description: 'Due date' })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Completion timestamp' })
  @IsOptional()
  completedAt?: string;

  @ApiPropertyOptional({ description: 'Verification timestamp' })
  @IsOptional()
  verifiedAt?: string;

  @ApiPropertyOptional({ description: 'Verified by user ID' })
  @IsOptional()
  @IsString()
  verifiedBy?: string;

  @ApiPropertyOptional({ description: 'Effectiveness rating' })
  @IsOptional()
  @IsString()
  effectiveness?: string;
}

export class CreateCertificateDto {
  @ApiProperty({ description: 'Diamond ID' })
  @IsString()
  @IsNotEmpty()
  diamondId!: string;

  @ApiProperty({ description: 'Lab ID' })
  @IsString()
  @IsNotEmpty()
  labId!: string;

  @ApiProperty({ description: 'Certificate number' })
  @IsString()
  @IsNotEmpty()
  certificateNo!: string;

  @ApiProperty({ description: 'Issue date' })
  @IsString()
  @IsNotEmpty()
  issueDate!: string;

  @ApiPropertyOptional({ description: 'PDF URL' })
  @IsOptional()
  @IsString()
  pdfUrl?: string;

  @ApiPropertyOptional({ description: 'Validation timestamp' })
  @IsOptional()
  validatedAt?: string;

  @ApiPropertyOptional({ description: 'Validated by user ID' })
  @IsOptional()
  @IsString()
  validatedBy?: string;
}

export class UpdateCertificateDto {
  @ApiPropertyOptional({ description: 'Certificate number' })
  @IsOptional()
  @IsString()
  certificateNo?: string;

  @ApiPropertyOptional({ description: 'PDF URL' })
  @IsOptional()
  @IsString()
  pdfUrl?: string;

  @ApiPropertyOptional({ description: 'Validation timestamp' })
  @IsOptional()
  validatedAt?: string;

  @ApiPropertyOptional({ description: 'Validated by user ID' })
  @IsOptional()
  @IsString()
  validatedBy?: string;
}

export class CertificateQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Diamond ID' })
  diamondId?: string;

  @ApiPropertyOptional({ description: 'Lab ID' })
  labId?: string;

  @ApiPropertyOptional({ description: 'Certificate number' })
  certificateNo?: string;
}
