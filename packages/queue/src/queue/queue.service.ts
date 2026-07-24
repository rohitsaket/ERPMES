import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

export interface MrpRunJob {
  companyId: string;
  runId?: string;
  mode?: 'full' | 'incremental';
}

export interface ErpSyncJob {
  connector: string;
  mode: 'full' | 'delta' | 'manual';
  externalRequestId?: string;
}

export interface ReportJob {
  reportType: string;
  companyId: string;
  parameters: Record<string, unknown>;
  format: 'pdf' | 'excel' | 'csv';
  userId: string;
}

export interface CertificatePollJob {
  requestId: string;
  labId: string;
  diamondId: string;
}

export interface ShipmentTrackingJob {
  shipmentId: string;
  carrierId: string;
  trackingNo: string;
}

export interface MaintenanceJob {
  assetId: string;
  type: 'preventive' | 'corrective' | 'predictive' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'emergency';
}

export interface NotificationJob {
  userId: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  category: string;
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
}

export interface ArchivalJob {
  olderThan: Date;
  entities: string[];
  dryRun?: boolean;
}

export interface AiBatchJob {
  batch: Array<{
    id: string;
    type: string;
    input: unknown;
  }>;
}

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('mrp') private mrpQueue: Queue,
    @InjectQueue('erp-sync') private erpSyncQueue: Queue,
    @InjectQueue('reports') private reportsQueue: Queue,
    @InjectQueue('certificates') private certificatesQueue: Queue,
    @InjectQueue('shipments') private shipmentsQueue: Queue,
    @InjectQueue('maintenance') private maintenanceQueue: Queue,
    @InjectQueue('notifications') private notificationsQueue: Queue,
    @InjectQueue('archival') private archivalQueue: Queue,
    @InjectQueue('ai') private aiQueue: Queue,
  ) {}

  async scheduleMrp(job: MrpRunJob, delay?: number): Promise<void> {
    await this.mrpQueue.add('mrp-run', job, { delay });
  }

  async scheduleErpSync(job: ErpSyncJob, delay?: number): Promise<void> {
    await this.erpSyncQueue.add('erp-sync', job, { delay });
  }

  async scheduleRecurringErpSync(job: ErpSyncJob, cron: string): Promise<void> {
    await this.erpSyncQueue.add('erp-sync', job, {
      repeat: { pattern: cron },
      jobId: `erp-sync-${job.connector}-recurring`,
    });
  }

  async generateReport(job: ReportJob): Promise<void> {
    await this.reportsQueue.add('generate-report', job);
  }

  async scheduleReport(job: ReportJob, cron: string): Promise<void> {
    await this.reportsQueue.add('generate-report', job, {
      repeat: { pattern: cron },
      jobId: `report-${job.reportType}-${job.companyId}-recurring`,
    });
  }

  async pollCertificate(job: CertificatePollJob): Promise<void> {
    await this.certificatesQueue.add('poll-certificate', job, {
      delay: 60000, // Start polling after 1 minute
    });
  }

  async scheduleCertificatePoll(job: CertificatePollJob, cron: string): Promise<void> {
    await this.certificatesQueue.add('poll-certificate', job, {
      repeat: { pattern: cron },
      jobId: `cert-poll-${job.requestId}-recurring`,
    });
  }

  async trackShipment(job: ShipmentTrackingJob): Promise<void> {
    await this.shipmentsQueue.add('track-shipment', job);
  }

  async scheduleShipmentTracking(job: ShipmentTrackingJob, cron: string): Promise<void> {
    await this.shipmentsQueue.add('track-shipment', job, {
      repeat: { pattern: cron },
      jobId: `shipment-track-${job.shipmentId}-recurring`,
    });
  }

  async scheduleMaintenance(job: MaintenanceJob, delay?: number): Promise<void> {
    await this.maintenanceQueue.add('schedule-maintenance', job, { delay });
  }

  async scheduleRecurringMaintenance(job: MaintenanceJob, cron: string): Promise<void> {
    await this.maintenanceQueue.add('schedule-maintenance', job, {
      repeat: { pattern: cron },
      jobId: `maintenance-${job.assetId}-recurring`,
    });
  }

  async sendNotification(job: NotificationJob): Promise<void> {
    await this.notificationsQueue.add('send-notification', job);
  }

  async sendBulkNotifications(jobs: NotificationJob[]): Promise<void> {
    await this.notificationsQueue.addBulk(jobs.map(job => ({
      name: 'send-notification',
      data: job,
    })));
  }

  async scheduleNotificationDigest(job: { userIds: string[]; frequency: 'daily' | 'weekly' }, cron: string): Promise<void> {
    await this.notificationsQueue.add('send-digest', job, {
      repeat: { pattern: cron },
      jobId: `digest-${job.frequency}-recurring`,
    });
  }

  async archiveData(job: ArchivalJob): Promise<void> {
    await this.archivalQueue.add('archive-data', job);
  }

  async scheduleArchival(job: ArchivalJob, cron: string): Promise<void> {
    await this.archivalQueue.add('archive-data', job, {
      repeat: { pattern: cron },
      jobId: `archival-recurring`,
    });
  }

  async processAiBatch(job: AiBatchJob): Promise<void> {
    await this.aiQueue.add('process-batch', job);
  }

  async getQueueStats(): Promise<Record<string, { waiting: number; active: number; completed: number; failed: number }>> {
    const queues = [
      { name: 'mrp', queue: this.mrpQueue },
      { name: 'erp-sync', queue: this.erpSyncQueue },
      { name: 'reports', queue: this.reportsQueue },
      { name: 'certificates', queue: this.certificatesQueue },
      { name: 'shipments', queue: this.shipmentsQueue },
      { name: 'maintenance', queue: this.maintenanceQueue },
      { name: 'notifications', queue: this.notificationsQueue },
      { name: 'archival', queue: this.archivalQueue },
      { name: 'ai', queue: this.aiQueue },
    ];

    const stats: Record<string, any> = {};
    for (const { name, queue } of queues) {
      const [waiting, active, completed, failed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
      ]);
      stats[name] = { waiting, active, completed, failed };
    }
    return stats;
  }

  async pauseQueue(name: string): Promise<void> {
    const queue = this.getQueue(name);
    if (queue) await queue.pause();
  }

  async resumeQueue(name: string): Promise<void> {
    const queue = this.getQueue(name);
    if (queue) await queue.resume();
  }

  async cleanQueue(name: string, grace: number = 86400000): Promise<void> {
    const queue = this.getQueue(name);
    if (queue) await queue.clean(grace, 100, 'completed');
  }

  private getQueue(name: string): Queue | undefined {
    const queues: Record<string, Queue> = {
      'mrp': this.mrpQueue,
      'erp-sync': this.erpSyncQueue,
      'reports': this.reportsQueue,
      'certificates': this.certificatesQueue,
      'shipments': this.shipmentsQueue,
      'maintenance': this.maintenanceQueue,
      'notifications': this.notificationsQueue,
      'archival': this.archivalQueue,
      'ai': this.aiQueue,
    };
    return queues[name];
  }
}
