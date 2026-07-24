import { Module } from '@nestjs/common';
import { OperationsController } from './operations.controller';
import { OperationsService } from './operations.service';
import { DiamondsController } from './diamonds.controller';
import { DiamondsService } from './diamonds.service';

@Module({
  controllers: [OperationsController, DiamondsController],
  providers: [OperationsService, DiamondsService],
  exports: [OperationsService, DiamondsService],
})
export class ManufacturingModule {}
