import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { QualityService } from './quality.service';
import type { CreateInspectionDto, UpdateInspectionDto, InspectionQueryDto } from './dto/quality.dto';

@ApiTags('Inspections')
@Controller('quality/inspections')
export class InspectionsController {
  constructor(private readonly service: QualityService) {}

  @Post()
  @ApiOperation({ summary: 'Create a quality inspection' })
  async create(@Body() dto: CreateInspectionDto) {
    return this.service.createInspection(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List quality inspections' })
  async findAll(@Query() query: InspectionQueryDto) {
    return this.service.findAllInspections(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inspection by ID' })
  @ApiParam({ name: 'id', description: 'Inspection ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOneInspection(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update inspection (record result)' })
  @ApiParam({ name: 'id', description: 'Inspection ID' })
  async update(@Param('id') id: string, @Body() dto: UpdateInspectionDto) {
    return this.service.updateInspection(id, dto);
  }
}
