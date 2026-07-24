import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { QualityService } from './quality.service';
import type { CreateNcrDto, UpdateNcrDto, NcrQueryDto, CreateCapaDto, UpdateCapaDto } from './dto/quality.dto';

@ApiTags('Nonconformances')
@Controller('quality/ncrs')
export class NcrsController {
  constructor(private readonly service: QualityService) {}

  @Post()
  @ApiOperation({ summary: 'Create a nonconformance (NCR)' })
  async create(@Body() dto: CreateNcrDto) {
    return this.service.createNcr(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List nonconformances' })
  async findAll(@Query() query: NcrQueryDto) {
    return this.service.findAllNcrs(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get NCR by ID' })
  @ApiParam({ name: 'id', description: 'NCR ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOneNcr(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update NCR' })
  @ApiParam({ name: 'id', description: 'NCR ID' })
  async update(@Param('id') id: string, @Body() dto: UpdateNcrDto) {
    return this.service.updateNcr(id, dto);
  }

  @Post(':ncrId/disposition')
  @ApiOperation({ summary: 'Record NCR disposition' })
  async disposition(@Param('ncrId') ncrId: string, @Body() dto: { disposition: string; dispositionedBy: string }) {
    return this.service.dispositionNcr(ncrId, dto);
  }

  @Post(':ncrId/capa')
  @ApiOperation({ summary: 'Create corrective action for NCR' })
  async createCapa(@Param('ncrId') ncrId: string, @Body() dto: CreateCapaDto) {
    return this.service.createCapa(ncrId, dto);
  }

  @Put(':ncrId/capa')
  @ApiOperation({ summary: 'Update corrective action' })
  async updateCapa(@Param('ncrId') ncrId: string, @Body() dto: UpdateCapaDto) {
    return this.service.updateCapa(ncrId, dto);
  }
}
