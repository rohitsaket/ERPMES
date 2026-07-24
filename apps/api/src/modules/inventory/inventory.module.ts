import { Module } from '@nestjs/common';
import { InventoryLotsController } from './inventory-lots.controller';
import { InventoryLotsService } from './inventory-lots.service';
import { InventoryTransactionsController } from './inventory-transactions.controller';
import { InventoryTransactionsService } from './inventory-transactions.service';

@Module({
  controllers: [InventoryLotsController, InventoryTransactionsController],
  providers: [InventoryLotsService, InventoryTransactionsService],
  exports: [InventoryLotsService, InventoryTransactionsService],
})
export class InventoryModule {}
