import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { DispatchService } from './dispatch.service';
import type { CreateShipmentDto, UpdateShipmentDto, ShipmentQueryDto } from './dto/dispatch.dto';

@ApiTags('Shipments')
@Controller('dispatch/shipments')
export class ShipmentsController {
  constructor(private readonly service: DispatchService) {}

  @Post()
  @ApiOperation({ summary: 'Create a shipment' })
  async create(@Body() dto: CreateShipmentDto) {
    return this.service.createShipment(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List shipments' })
  async findAll(@Query() query: ShipmentQueryDto) {
    return this.service.findAllShipments(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shipment by ID' })
  @ApiParam({ name: 'id', description: 'Shipment ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOneShipment(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update shipment' })
  @ApiParam({ name: 'id', description: 'Shipment ID' })
  async update(@Param('id') id: string, @Body() dto: UpdateShipmentDto) {
    return this.service.updateShipment(id, dto);
  }

  @Post(':id/dispatch')
  @ApiOperation({ summary: 'Mark shipment as dispatched' })
  async dispatch(@Param('id') id: string) {
    return this.service.dispatchShipment(id);
  }

  @Post(':id/deliver')
  @ApiOperation({ summary: 'Mark shipment as delivered' })
  async deliver(@Param('id') id: string) {
    return this.service.deliverShipment(id);
  }

  @Post(':shipmentId/tracking')
  @ApiOperation({ summary: 'Add tracking event to shipment' })
  async addTracking(@Param('shipmentId') shipmentId: string, @Body() dto: { status: string; location?: string }) {
    return this.service.addTrackingEvent(shipmentId, dto);
  }
}
