import type { InboxRepository, InboxEvent } from '../domain-events';

export class InboxProcessor {
  private _repository: InboxRepository;
  private _handlers: Map<string, Map<string, (event: any) => Promise<void>>> = new Map();
  private _interval: NodeJS.Timeout | null = null;
  private _batchSize: number;
  private _pollInterval: number;
  private _maxRetries: number;
  private _baseDelay: number;

  constructor(
    repository: InboxRepository,
    batchSize: number = 100,
    pollInterval: number = 1000,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ) {
    this._repository = repository;
    this._batchSize = batchSize;
    this._pollInterval = pollInterval;
    this._maxRetries = maxRetries;
    this._baseDelay = baseDelay;
  }

  registerHandler(eventType: string, consumer: string, handler: (event: any) => Promise<void>): void {
    if (!this._handlers.has(eventType)) {
      this._handlers.set(eventType, new Map());
    }
    this._handlers.get(eventType)!.set(consumer, handler);
  }

  async start(): Promise<void> {
    this._interval = setInterval(() => this.processInbox(), 1000);
  }

  async stop(): Promise<void> {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }

  private async processInbox(): Promise<void> {
    const events = await this._repository.getPending(this._batchSize);
    if (events.length === 0) return;

    for (const event of events) {
      await this.processEvent(event);
    }
  }

  private async processEvent(event: InboxEvent): Promise<void> {
    try {
      const handlers = this._handlers.get(event.eventType);
      if (!handlers) {
        await this._repository.update({
          ...event,
          status: 'COMPLETED',
          processedAt: new Date(),
        });
        return;
      }

      const handler = handlers.get(event.consumer);
      if (!handler) {
        await this._repository.update({
          ...event,
          status: 'COMPLETED',
          processedAt: new Date(),
        });
        return;
      }

      await this._repository.update({
        ...event,
        status: 'PROCESSING',
        retries: event.retries + 1,
      });

      try {
        await handler(event);
        await this._repository.update({
          ...event,
          status: 'COMPLETED',
          processedAt: new Date(),
        });
      } catch (error: unknown) {
        const failure = error instanceof Error ? error : new Error('Unknown inbox handler error');
        const retries = event.retries + 1;
        if (retries >= 3) {
          await this._repository.update({
            ...event,
            status: 'DEAD_LETTER',
            error: { message: failure.message, stack: failure.stack },
          });
        } else {
          const delay = this._baseDelay * Math.pow(2, retries - 1);
          setTimeout(() => this.processEvent({
            ...event,
            status: 'PENDING',
            retries,
          }), delay);
        }
      }
    } catch (error) {
      console.error(`Error processing inbox event ${event.id}:`, error);
    }
  }
}
