import { Injectable } from '@nestjs/common';
import { PrismaService } from '@diamondflow/database';
import type { DomainEvent, OrganizationScope } from '../../../domain/src/aggregate-root';
import { v4 as uuidv4 } from 'uuid';

export interface OutboxEventPayload {
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  version: number;
  payload: unknown;
  metadata?: Record<string, unknown>;
  correlationId?: string;
  causationId?: string;
}

@Injectable()
export class OutboxPublisher {
  constructor(private prisma: PrismaService) {}

  async publish(event: OutboxEventPayload, orgScope: OrganizationScope): Promise<void> {
    await this.prisma.outboxEvent.create({
      data: {
        eventType: event.eventType,
        aggregateType: event.aggregateType,
        aggregateId: event.aggregateId,
        version: event.version,
        payload: event.payload as any,
        metadata: event.metadata ?? {},
        correlationId: event.correlationId ?? uuidv4(),
        causationId: event.causationId,
        status: 'pending',
      },
    });
  }

  async publishBatch(events: OutboxEventPayload[], orgScope: OrganizationScope): Promise<void> {
    const records = events.map((event) => ({
      eventType: event.eventType,
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      version: event.version,
      payload: event.payload as any,
      metadata: event.metadata ?? {},
      correlationId: event.correlationId ?? uuidv4(),
      causationId: event.causationId,
      status: 'pending' as const,
    }));

    await this.prisma.outboxEvent.createMany({ data: records });
  }
}

@Injectable()
export class OutboxProcessor {
  private readonly batchSize = 100;
  private readonly pollInterval = 100; // ms
  private isRunning = false;

  constructor(
    private prisma: PrismaService,
    private eventBus: any, // EventBus
  ) {}

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
        console.error('Outbox processor error:', error);
      }
      await this.sleep(this.pollInterval);
    }
  }

  private async processBatch(): Promise<void> {
    const events = await this.prisma.outboxEvent.findMany({
      where: { status: 'pending' },
      take: this.batchSize,
      orderBy: { createdAt: 'asc' },
    });

    if (events.length === 0) return;

    for (const event of events) {
      try {
        await this.publishEvent(event);
        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: { status: 'published', publishedAt: new Date() },
        });
      } catch (error) {
        console.error(`Failed to publish event ${event.id}:`, error);
        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: { status: 'failed' },
        });
      }
    }
  }

  private async publishEvent(event: any): Promise<void> {
    const domainEvent: DomainEvent = {
      eventId: event.id,
      eventType: event.eventType,
      version: event.version,
      aggregateId: event.aggregateId,
      aggregateType: event.aggregateType,
      timestamp: event.createdAt,
      correlationId: event.correlationId || '',
      causationId: event.causationId,
      userId: event.metadata?.userId as string || 'system',
      organizationScope: {
        companyId: event.metadata?.companyId as string || '',
        branchId: event.metadata?.branchId as string,
        factoryId: event.metadata?.factoryId as string,
        departmentId: event.metadata?.departmentId as string,
      },
      payload: event.payload,
    };

    await this.eventBus.publish(domainEvent);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
