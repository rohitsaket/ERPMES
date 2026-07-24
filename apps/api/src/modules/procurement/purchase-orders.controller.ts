import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import type { CreatePurchaseOrderDto, UpdatePurchaseOrderDto, QueryPurchaseOrderDto } from './dto/purchase-order.dto';

@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly service: PurchaseOrdersService) {}

  @Post() create(@Body() dto: CreatePurchaseOrderDto) { return this.service.create(dto); }
  @Get() findAll(@Query() query: QueryPurchaseOrderDto) { return this.service.findAll(query); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdatePurchaseOrderDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
  @Post(':id/place') place(@Param('id') id: string) { return this.service.place(id); }
  @Post(':id/receive') receive(@Param('id') id: string) { return this.service.receive(id); }
}
