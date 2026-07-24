import { Module } from '@nestjs/common';
import { ProductionOrdersController } from './production-orders.controller';
import { ProductionOrdersService } from './production-orders.service';
import { MrpController } from './mrp.controller';
import { MrpService } from './mrp.service';

@Module({
  controllers: [ProductionOrdersController, MrpController],
  providers: [ProductionOrdersService, MrpService],
  exports: [ProductionOrdersService, MrpService],
})
export class PlanningModule {}
