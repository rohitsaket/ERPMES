import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { PurchaseRequisitionsService } from './purchase-requisitions.service';
import type { CreatePurchaseRequisitionDto, UpdatePurchaseRequisitionDto, QueryPurchaseRequisitionDto } from './dto/purchase-requisition.dto';

@Controller('purchase-requisitions')
export class PurchaseRequisitionsController {
  constructor(private readonly service: PurchaseRequisitionsService) {}

  @Post() create(@Body() dto: CreatePurchaseRequisitionDto) { return this.service.create(dto); }
  @Get() findAll(@Query() query: QueryPurchaseRequisitionDto) { return this.service.findAll(query); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdatePurchaseRequisitionDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
  @Post(':id/submit') submit(@Param('id') id: string) { return this.service.submit(id); }
  @Post(':id/approve') approve(@Param('id') id: string) { return this.service.approve(id); }
}
