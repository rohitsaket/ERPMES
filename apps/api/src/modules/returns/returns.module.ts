import { Module } from '@nestjs/common';
import { AuthorizationsController } from './authorizations.controller';
import { ReceiptsController } from './receipts.controller';
import { RepairOrdersController } from './repair-orders.controller';
import { ReturnsService } from './returns.service';

@Module({
  controllers: [
    AuthorizationsController,
    ReceiptsController,
    RepairOrdersController,
  ],
  providers: [ReturnsService],
  exports: [ReturnsService],
})
export class ReturnsModule {}
