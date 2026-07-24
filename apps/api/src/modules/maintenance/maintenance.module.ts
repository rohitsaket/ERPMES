import { Module } from '@nestjs/common';
import { AssetsController } from './assets.controller';
import { WorkOrdersController } from './work-orders.controller';
import { SchedulesController } from './schedules.controller';
import { MaintenanceService } from './maintenance.service';

@Module({
  controllers: [AssetsController, WorkOrdersController, SchedulesController],
  providers: [MaintenanceService],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
