import { Queue, Worker, Job } from 'bullmq';

export const queueTokens = {
  MRP: 'mrp',
  ERP_SYNC: 'erp-sync',
  REPORTS: 'reports',
  CERTIFICATES: 'certificates',
  SHIPMENTS: 'shipments',
  MAINTENANCE: 'maintenance',
  NOTIFICATIONS: 'notifications',
  ARCHIVAL: 'archival',
  AI_BATCH: 'ai-batch',
} as const;

export const queueConfig = {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
};