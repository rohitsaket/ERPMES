import type { OutboxRepository } from '../domain-events';

export class OutboxPublisher {
  private _repository: OutboxRepository;
  private _interval: NodeJS.Timeout | null = null;
  private _batchSize: number;
  private _pollInterval: number;

  constructor(repository: OutboxRepository, batchSize: number = 100, pollInterval: number = 100) {
    this._repository = repository;
    this._batchSize = batchSize;
    this._pollInterval = pollInterval;
  }

  async start(): Promise<void> {
    this._interval = setInterval(() => this.processOutbox(), this._pollInterval);
  }

  async stop(): Promise<void> {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }

  private async processOutbox(): Promise<void> {
    const events = await this._repository.getUnpublished(this._batchSize);
    if (events.length === 0) return;

    for (const event of events) {
      try {
        // In a real implementation, this would publish to a message broker
        // For now, we just mark as published
        await this._repository.markPublished(event.id);
      } catch (error) {
        console.error(`Failed to publish event ${event.id}:`, error);
      }
    }
  }
}

export interface OutboxEventHandler {
  handle(event: any): Promise<void>;
}
