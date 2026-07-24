import { Module } from '@nestjs/common';
import { BagsController } from './bags.controller';
import { ShipmentsController } from './shipments.controller';
import { CarriersController } from './carriers.controller';
import { DispatchService } from './dispatch.service';

@Module({
  controllers: [BagsController, ShipmentsController, CarriersController],
  providers: [DispatchService],
  exports: [DispatchService],
})
export class DispatchModule {}
