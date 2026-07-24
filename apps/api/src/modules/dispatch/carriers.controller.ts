import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { DispatchService } from './dispatch.service';
import type { CreateCarrierDto, UpdateCarrierDto, CarrierQueryDto } from './dto/dispatch.dto';

@ApiTags('Carriers')
@Controller('dispatch/carriers')
export class CarriersController {
  constructor(private readonly service: DispatchService) {}

  @Post()
  @ApiOperation({ summary: 'Create a carrier' })
  async create(@Body() dto: CreateCarrierDto) {
    return this.service.createCarrier(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List carriers' })
  async findAll(@Query() query: CarrierQueryDto) {
    return this.service.findAllCarriers(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get carrier by ID' })
  @ApiParam({ name: 'id', description: 'Carrier ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOneCarrier(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update carrier' })
  @ApiParam({ name: 'id', description: 'Carrier ID' })
  async update(@Param('id') id: string, @Body() dto: UpdateCarrierDto) {
    return this.service.updateCarrier(id, dto);
  }
}
