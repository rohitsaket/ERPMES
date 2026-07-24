import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ProductionOrdersService } from './production-orders.service';
import type { CreateProductionOrderDto, UpdateProductionOrderDto, QueryProductionOrderDto, CreateOperationDto, UpdateOperationDto } from './dto/production-order.dto';

@Controller('production-orders')
export class ProductionOrdersController {
  constructor(private readonly service: ProductionOrdersService) {}

  @Post()
  create(@Body() dto: CreateProductionOrderDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryProductionOrderDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductionOrderDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/release')
  release(@Param('id') id: string) {
    return this.service.release(id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.service.cancel(id);
  }

  @Post(':id/operations')
  addOperation(@Param('id') id: string, @Body() dto: CreateOperationDto) {
    return this.service.addOperation(id, dto);
  }

  @Put(':id/operations/:opId')
  updateOperation(@Param('id') id: string, @Param('opId') opId: string, @Body() dto: UpdateOperationDto) {
    return this.service.updateOperation(id, opId, dto);
  }
}
