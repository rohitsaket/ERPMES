import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MrpProcessor } from './processors/mrp-processor';
import { ErpSyncProcessor } from './processors/erp-sync-processor';
import { ReportProcessor } from './processors/report-processor';
import { CertificateProcessor } from './processors/certificate-processor';
import { ShipmentProcessor } from './processors/shipment-processor';
import { MaintenanceProcessor } from './processors/maintenance-processor';
import { AiBatchProcessor } from './processors/ai-batch-processor';
import { NotificationProcessor } from './processors/notification-processor';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    }),
    BullModule.registerQueue(
      { name: 'mrp' },
      { name: 'erp-sync' },
      { name: 'reports' },
      { name: 'certificates' },
      { name: 'shipments' },
      { name: 'maintenance' },
      { name: 'notifications' },
      { name: 'archival' },
      { name: 'ai-processing' },
    ),
  ],
  providers: [
    MrpProcessor,
    ErpSyncProcessor,
    ReportProcessor,
    CertificateProcessor,
    ShipmentProcessor,
    MaintenanceProcessor,
    AiBatchProcessor,
    NotificationProcessor,
  ],
  exports: [
    BullModule,
    MrpProcessor,
    ErpSyncProcessor,
    ReportProcessor,
    CertificateProcessor,
    ShipmentProcessor,
    MaintenanceProcessor,
    AiBatchProcessor,
    NotificationProcessor,
  ],
})
export class QueueModule {}