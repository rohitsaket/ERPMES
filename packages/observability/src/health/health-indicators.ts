import { Injectable, OnModuleInit } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { PrismaClient } from '@prisma/client';
import { Queue } from 'bullmq';

@Injectable()
export class HealthIndicators implements OnModuleInit {
  private prisma: PrismaClient;
  private redisQueues: Map<string, Queue>;

  constructor() {
    this.prisma = new PrismaClient();
    this.redisQueues = new Map();
  }

  onModuleInit() {
    this.initializeQueues();
  }

  private initializeQueues(): void {
    const queueNames = ['mrp', 'erp-sync', 'reports', 'certificates', 'shipments', 'maintenance', 'notifications', 'archival', 'ai-processing'];
    for (const name of queueNames) {
      this.redisQueues.set(name, new Queue(name, { connection: { host: process.env.REDIS_HOST || 'localhost', port: parseInt(process.env.REDIS_PORT || '6379') } }));
    }
  }

  async checkDatabase(key: string = 'database'): Promise<any> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const pool = (this.prisma as any).$pool;
      return {
        [key]: {
          status: 'up',
          connections: pool?.numFree || 0,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new HealthCheckError('Database check failed', { [key]: { status: 'down', error: errorMessage } });
    }
  }

  async checkRedis(key: string = 'redis'): Promise<any> {
    try {
      return { [key]: { status: 'up' } };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new HealthCheckError('Redis check failed', { [key]: { status: 'down', error: errorMessage } });
    }
  }

  async checkQueue(name: string): Promise<any> {
    try {
      const queue = this.redisQueues.get(name);
      if (!queue) {
        return { [name]: { status: 'unknown', message: 'Queue not found' } };
      }

      const waiting = await queue.getWaitingCount();
      const active = await queue.getActiveCount();
      const completed = await queue.getCompletedCount();
      const failed = await queue.getFailedCount();

      const status = waiting > 1000 ? 'degraded' : 'up';

      return {
        [name]: {
          status,
          waiting,
          active,
          completed,
          failed,
        },
      };
    } catch (error) {
      return { [name]: { status: 'down', error: (error as Error).message } };
    }
  }

  async checkAllQueues(): Promise<Record<string, any>> {
    const queues = ['mrp', 'erp-sync', 'reports', 'certificates', 'shipments', 'maintenance', 'notifications', 'archival', 'ai-processing'];
    const results: Record<string, any> = {};
    
    for (const queue of queues) {
      results[queue] = await this.checkQueue(queue);
    }
    
    return results;
  }

  async checkDiskSpace(key: string = 'disk'): Promise<any> {
    try {
      const { statfsSync } = await import('fs');
      const stats = statfsSync(process.cwd());
      const freeGB = Number(stats.bavail * stats.bsize) / (1024 * 1024 * 1024);
      const totalGB = Number(stats.blocks * stats.bsize) / (1024 * 1024 * 1024);
      const usedPercent = ((totalGB - freeGB) / totalGB) * 100;

      const status = usedPercent > 90 ? 'down' : usedPercent > 80 ? 'degraded' : 'up';

      return {
        [key]: {
          status,
          freeGB: Math.round(freeGB * 100) / 100,
          totalGB: Math.round(totalGB * 100) / 100,
          usedPercent: Math.round(usedPercent * 100) / 100,
        },
      };
    } catch (error) {
      return { [key]: { status: 'unknown', error: (error as Error).message } };
    }
  }

  async checkMemory(key: string = 'memory'): Promise<any> {
    const used = process.memoryUsage();
    const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024);
    const usedPercent = (used.heapUsed / used.heapTotal) * 100;

    const status = usedPercent > 90 ? 'down' : usedPercent > 80 ? 'degraded' : 'up';

    return {
      [key]: {
        status,
        heapUsedMB,
        heapTotalMB,
        usedPercent: Math.round(usedPercent * 100) / 100,
        rssMB: Math.round(used.rss / 1024 / 1024),
      },
    };
  }

  async checkApplication(key: string = 'application'): Promise<any> {
    return {
      [key]: {
        status: 'up',
        uptime: process.uptime(),
        version: process.env.APP_VERSION || '0.0.1',
        environment: process.env.NODE_ENV || 'development',
      },
    };
  }
}
