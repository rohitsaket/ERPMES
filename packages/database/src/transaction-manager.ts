import { prisma, PrismaClient } from './prisma-client.js';

export type TransactionCallback<T> = (tx: PrismaClient) => Promise<T>;
export type OutboxEventPayload = {
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  version: number;
  payload: unknown;
  metadata?: Record<string, unknown>;
  correlationId?: string;
  causationId?: string;
};

export class TransactionManager {
  async run<T>(callback: TransactionCallback<T>): Promise<T> {
    return prisma.$transaction(callback);
  }

  async runWithOutbox<T>(
    callback: (tx: PrismaClient) => Promise<{ result: T; events: OutboxEventPayload[] }>
  ): Promise<T> {
    return prisma.$transaction(async (tx) => {
      const { result, events } = await callback(tx);

      if (events.length > 0) {
        await this.writeOutboxEvents(tx, events);
      }

      return result;
    });
  }

  private async writeOutboxEvents(
    tx: PrismaClient,
    events: OutboxEventPayload[]
  ): Promise<void> {
    const outboxRecords = events.map((event) => ({
      eventType: event.eventType,
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      version: event.version,
      payload: event.payload,
      metadata: event.metadata ?? {},
      correlationId: event.correlationId,
      causationId: event.causationId,
      status: 'pending' as const,
    }));

    await tx.outboxEvent.createMany({ data: outboxRecords });
  }

  async runSequential<T>(callbacks: Array<TransactionCallback<T>>): Promise<T[]> {
    return prisma.$transaction(async (tx) => {
      const results: T[] = [];
      for (const cb of callbacks) {
        results.push(await cb(tx));
      }
      return results;
    });
  }
}

export const transactionManager = new TransactionManager();