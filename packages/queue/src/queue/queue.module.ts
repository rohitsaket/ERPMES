import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueService } from './queue.service.js';
import { QueueProcessor } from './queue.processor.js';

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
        password: process.env.REDIS_PASSWORD,
        maxRetriesPerRequest: null,
      },
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
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
      { name: 'ai' },
    ),
  ],
  providers: [QueueService, QueueProcessor],
  exports: [QueueService],
})
export class QueueModule {}
