import { Injectable } from '@nestjs/common';
import { PrismaService } from '@diamondflow/database';
import type { DomainEvent } from '../../../domain/src/aggregate-root';

export interface InboxEventRecord {
  id: string;
  eventId: string;
  consumer: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  version: number;
  payload: any;
  status: 'pending' | 'processing' | 'processed' | 'failed' | 'dlq';
  retries: number;
  maxRetries: number;
  lastError?: any;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class InboxProcessor {
  private readonly maxRetries = 3;
  private readonly batchSize = 50;
  private readonly pollInterval = 1000; // ms
  private isRunning = false;
  private handlers: Map<string, (event: DomainEvent) => Promise<void>> = new Map();

  constructor(private prisma: PrismaService) {}

  registerHandler(consumer: string, handler: (event: DomainEvent) => Promise<void>): void {
    this.handlers.set(consumer, handler);
  }

  async start(): Promise<void> {
    this.isRunning = true;
    this.processLoop();
  }

  async stop(): Promise<void> {
    this.isRunning = false;
  }

  private async processLoop(): Promise<void> {
    while (this.isRunning) {
      try {
        await this.processBatch();
      } catch (error) {
        console.error('Inbox processor error:', error);
      }
      await this.sleep(this.pollInterval);
    }
  }

  private async processBatch(): Promise<void> {
    const events = await this.prisma.inboxEvent.findMany({
      where: { status: { in: ['pending', 'failed'] } },
      take: this.batchSize,
      orderBy: { createdAt: 'asc' },
    });

    if (events.length === 0) return;

    for (const event of events) {
      const handler = this.handlers.get(event.consumer);
      if (!handler) {
        console.warn(`No handler registered for consumer: ${event.consumer}`);
        continue;
      }

      try {
        await this.processEvent(event, handler);
      } catch (error) {
        await this.handleError(event, error);
      }
    }
  }

  private async processEvent(event: InboxEventRecord, handler: (event: DomainEvent) => Promise<void>): Promise<void> {
    await this.prisma.inboxEvent.update({
      where: { id: event.id },
      data: { status: 'processing' },
    });

    const domainEvent: DomainEvent = {
      eventId: event.eventId,
      eventType: event.eventType,
      version: event.version,
      aggregateId: event.aggregateId,
      aggregateType: event.aggregateType,
      timestamp: event.createdAt,
      correlationId: '', // Not stored in inbox
      causationId: '',
      userId: '',
      organizationScope: {
        companyId: '',
      },
      payload: event.payload,
    };

    await handler(domainEvent);

    await this.prisma.inboxEvent.update({
      where: { id: event.id },
      data: { status: 'processed', processedAt: new Date() },
    });
  }

  private async handleError(event: InboxEventRecord, error: any): Promise<void> {
    const newRetries = event.retries + 1;

    if (newRetries >= this.maxRetries) {
      await this.prisma.inboxEvent.update({
        where: { id: event.id },
        data: {
          status: 'dlq',
          retries: newRetries,
          lastError: { message: error.message, stack: error.stack },
        },
      });
    } else {
      await this.prisma.inboxEvent.update({
        where: { id: event.id },
        data: {
          status: 'failed',
          retries: newRetries,
          lastError: { message: error.message, stack: error.stack },
        },
      });
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

@Injectable()
export class IdempotencyHandler {
  constructor(private prisma: PrismaService) {}

  async checkAndMark(idempotencyKey: string): Promise<boolean> {
    const existing = await this.prisma.inboxEvent.findUnique({
      where: { id: idempotencyKey },
    });

    if (existing) {
      return false; // Already processed
    }

    await this.prisma.inboxEvent.create({
      data: {
        id: idempotencyKey,
        eventId: idempotencyKey,
        consumer: 'idempotency',
        eventType: 'idempotency',
        aggregateType: '',
        aggregateId: '',
        version: 1,
        payload: {},
        status: 'processed',
      },
    });

    return true;
  }
}
