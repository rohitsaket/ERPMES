import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ReturnsService } from './returns.service';
import type { CreateRepairOrderDto, UpdateRepairOrderDto, RepairOrderQueryDto, CreateRedispatchDto } from './dto/returns.dto';

@ApiTags('Repair Orders')
@Controller('returns/repair-orders')
export class RepairOrdersController {
  constructor(private readonly service: ReturnsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a repair order' })
  async create(@Body() dto: CreateRepairOrderDto) {
    return this.service.createRepairOrder(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List repair orders' })
  async findAll(@Query() query: RepairOrderQueryDto) {
    return this.service.findAllRepairOrders(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get repair order by ID' })
  @ApiParam({ name: 'id', description: 'Repair Order ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOneRepairOrder(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update repair order' })
  @ApiParam({ name: 'id', description: 'Repair Order ID' })
  async update(@Param('id') id: string, @Body() dto: UpdateRepairOrderDto) {
    return this.service.updateRepairOrder(id, dto);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete repair order' })
  async complete(@Param('id') id: string) {
    return this.service.updateRepairOrder(id, { status: 'COMPLETED', completedAt: new Date().toISOString() });
  }

  @Post(':id/redispatch')
  @ApiOperation({ summary: 'Create redispatch for completed repair' })
  async createRedispatch(@Param('id') id: string, @Body() dto: CreateRedispatchDto) {
    return this.service.createRedispatch(id, dto);
  }
}