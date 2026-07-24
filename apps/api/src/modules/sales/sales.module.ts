import { Module } from '@nestjs/common';
import { QuotationsController } from './quotations.controller';
import { QuotationsService } from './quotations.service';
import { SalesOrdersController } from './sales-orders.controller';
import { SalesOrdersService } from './sales-orders.service';

@Module({
  controllers: [QuotationsController, SalesOrdersController],
  providers: [QuotationsService, SalesOrdersService],
  exports: [QuotationsService, SalesOrdersService],
})
export class SalesModule {}
