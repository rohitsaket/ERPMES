import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { InventoryLotsService } from './inventory-lots.service';
import type { CreateInventoryLotDto, UpdateInventoryLotDto, QueryInventoryLotDto } from './dto/inventory-lot.dto';

@Controller('inventory/lots')
export class InventoryLotsController {
  constructor(private readonly service: InventoryLotsService) {}

  @Post() create(@Body() dto: CreateInventoryLotDto) { return this.service.create(dto); }
  @Get() findAll(@Query() query: QueryInventoryLotDto) { return this.service.findAll(query); }
  @Get('summary') summary(@Query('companyId') companyId: string) { return this.service.getSummary(companyId); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateInventoryLotDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
