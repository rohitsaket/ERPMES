import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';
import { WorkCentersController } from './work-centers.controller';
import { WorkCentersService } from './work-centers.service';

@Module({
  controllers: [
    ProductsController,
    CustomersController,
    VendorsController,
    WorkCentersController,
  ],
  providers: [
    ProductsService,
    CustomersService,
    VendorsService,
    WorkCentersService,
  ],
  exports: [
    ProductsService,
    CustomersService,
    VendorsService,
    WorkCentersService,
  ],
})
export class MasterDataModule {}
