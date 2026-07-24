import { Job, Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface JobContext {
  prisma: PrismaClient;
  logger: Console;
}

export type JobDataMap = {
  'mrp': { companyId: string; runId?: string };
  'erp-sync': { connectorId: string; importMode: 'FULL' | 'INCREMENTAL' | 'DELTA' | 'MANUAL'; externalRequestId?: string };
  'reports': { reportId: string; companyId: string; format: 'PDF' | 'EXCEL' | 'CSV' };
  'certificates': { certificateId: string; labId: string };
  'shipments': { shipmentId: string; carrierId: string };
  'maintenance': { assetId: string; dueDate: Date };
  'notifications': { userId: string; digestType: 'DAILY' | 'WEEKLY' };
  'archival': { companyId: string; olderThan: Date; entityTypes: string[] };
  'ai-processing': { companyId: string; modelId: string; inputIds: string[] };
};

export type JobData = JobDataMap[keyof JobDataMap];

export interface JobMetadata {
  name: string;
  data: any;
  options?: {
    attempts?: number;
    backoff?: { type: 'exponential' | 'fixed'; delay: number };
    removeOnComplete?: boolean | number;
    removeOnFail?: boolean | number;
    priority?: number;
    delay?: number;
    repeat?: { pattern: string } | { every: number };
  };
}

export interface JobRegistryEntry {
  name: string;
  processor: string;
  metadata: JobMetadata;
}

export const JOB_REGISTRY = {
  mrp: {
    name: 'mrp',
    processor: 'mrp',
    metadata: {
      name: 'mrp',
      data: { companyId: '' },
      options: { attempts: 3, backoff: { type: 'exponential', delay: 1000 }, priority: 10 },
    },
  },
  'erp-sync': {
    name: 'erp-sync',
    processor: 'erp-sync',
    metadata: {
      name: 'erp-sync',
      data: { companyId: '', mode: 'INCREMENTAL' },
      options: { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
    },
  },
  reports: {
    name: 'reports',
    processor: 'reports',
    metadata: {
      name: 'reports',
      data: { reportId: '', companyId: '', format: 'PDF' },
      options: { attempts: 2, backoff: { type: 'exponential', delay: 1000 } },
    },
  },
  certificates: {
    name: 'certificates',
    processor: 'certificates',
    metadata: {
      name: 'certificates',
      data: { certificateId: '', labId: '' },
      options: { attempts: 5, backoff: { type: 'exponential', delay: 60000 } },
    },
  },
  shipments: {
    name: 'shipments',
    processor: 'shipments',
    metadata: {
      name: 'shipments',
      data: { shipmentId: '', carrierId: '' },
      options: { attempts: 3, backoff: { type: 'exponential', delay: 30000 } },
    },
  },
  maintenance: {
    name: 'maintenance',
    processor: 'maintenance',
    metadata: {
      name: 'maintenance',
      data: { companyId: '' },
      options: { attempts: 2 },
    },
  },
  notifications: {
    name: 'notifications',
    processor: 'notifications',
    metadata: {
      name: 'notifications',
      data: { userId: '', digestType: 'DAILY' },
      options: { attempts: 3 },
    },
  },
  archival: {
    name: 'archival',
    processor: 'archival',
    metadata: {
      name: 'archival',
      data: { companyId: '', olderThan: new Date(), entityTypes: [] },
      options: { attempts: 1 },
    },
  },
  'ai-processing': {
    name: 'ai-processing',
    processor: 'ai-processing',
    metadata: {
      name: 'ai-processing',
      data: { companyId: '', modelId: '', inputIds: [] },
      options: { attempts: 3 },
    },
  },
} as const;

export function getJobRegistryEntry(name: string) {
  return (JOB_REGISTRY as Record<string, any>)[name];
}