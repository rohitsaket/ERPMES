import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { InventoryTransactionsService } from './inventory-transactions.service';
import type { CreateInventoryTransactionDto, QueryInventoryTransactionDto, TransferDto, AdjustmentDto } from './dto/inventory-transaction.dto';

@Controller('inventory/transactions')
export class InventoryTransactionsController {
  constructor(private readonly service: InventoryTransactionsService) {}

  @Post() create(@Body() dto: CreateInventoryTransactionDto) { return this.service.create(dto); }
  @Get() findAll(@Query() query: QueryInventoryTransactionDto) { return this.service.findAll(query); }
  @Post('transfer') transfer(@Body() dto: TransferDto) { return this.service.transfer(dto); }
  @Post('adjust') adjust(@Body() dto: AdjustmentDto) { return this.service.adjust(dto); }
}
