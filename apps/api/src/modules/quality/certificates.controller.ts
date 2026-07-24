import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { QualityService } from './quality.service';
import type { CreateCertificateDto, UpdateCertificateDto, CertificateQueryDto } from './dto/quality.dto';

@ApiTags('Certificates')
@Controller('quality/certificates')
export class CertificatesController {
  constructor(private readonly service: QualityService) {}

  @Post()
  @ApiOperation({ summary: 'Create a certificate' })
  async create(@Body() dto: CreateCertificateDto) {
    return this.service.createCertificate(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List certificates' })
  async findAll(@Query() query: CertificateQueryDto) {
    return this.service.findAllCertificates(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get certificate by ID' })
  @ApiParam({ name: 'id', description: 'Certificate ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOneCertificate(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update certificate' })
  @ApiParam({ name: 'id', description: 'Certificate ID' })
  async update(@Param('id') id: string, @Body() dto: UpdateCertificateDto) {
    return this.service.updateCertificate(id, dto);
  }

  @Post(':id/validate')
  @ApiOperation({ summary: 'Validate certificate' })
  async validate(@Param('id') id: string, @Body() dto: { validatedBy: string }) {
    return this.service.validateCertificate(id, dto.validatedBy);
  }
}
