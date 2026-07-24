import { Module } from '@nestjs/common';
import { PurchaseRequisitionsController } from './purchase-requisitions.controller';
import { PurchaseRequisitionsService } from './purchase-requisitions.service';
import { RfqsController } from './rfqs.controller';
import { RfqsService } from './rfqs.service';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrdersService } from './purchase-orders.service';

@Module({
  controllers: [PurchaseRequisitionsController, RfqsController, PurchaseOrdersController],
  providers: [PurchaseRequisitionsService, RfqsService, PurchaseOrdersService],
  exports: [PurchaseRequisitionsService, RfqsService, PurchaseOrdersService],
})
export class ProcurementModule {}
