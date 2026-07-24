import { Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';

@Module({
  controllers: [CompaniesController, BranchesController],
  providers: [CompaniesService, BranchesService],
  exports: [CompaniesService, BranchesService],
})
export class CompaniesModule {}