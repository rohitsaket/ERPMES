import { Module } from '@nestjs/common';
import { InspectionPlansController } from './inspection-plans.controller';
import { InspectionsController } from './inspections.controller';
import { NcrsController } from './ncrs.controller';
import { CertificatesController } from './certificates.controller';
import { QualityService } from './quality.service';

@Module({
  controllers: [InspectionPlansController, InspectionsController, NcrsController, CertificatesController],
  providers: [QualityService],
  exports: [QualityService],
})
export class QualityModule {}
