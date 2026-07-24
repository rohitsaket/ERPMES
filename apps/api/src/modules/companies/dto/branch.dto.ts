import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsObject, MaxLength } from 'class-validator';

export class CreateBranchDto {
  @ApiProperty({ example: 'New York HQ', description: 'Branch name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'NYHQ', description: 'Unique branch code (uppercase, alphanumeric)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  code!: string;

  @ApiPropertyOptional({ description: 'Branch address' })
  address?: any;

  @ApiPropertyOptional({ example: 'America/New_York', description: 'IANA timezone' })
  @IsOptional()
  @IsString()
  timezone?: string;
}

export class UpdateBranchDto {
  @ApiPropertyOptional({ example: 'New York HQ Updated', description: 'Branch name' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Branch address' })
  @IsOptional()
  @IsObject()
  address?: any;

  @ApiPropertyOptional({ example: 'America/Los_Angeles', description: 'IANA timezone' })
  @IsOptional()
  @IsString()
  timezone?: string;
}

export class BranchQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  limit?: number = 20;

  @ApiPropertyOptional({ example: 'New York', description: 'Search term' })
  search?: string;
}
