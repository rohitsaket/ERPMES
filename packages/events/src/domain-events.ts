export interface DomainEvent<T = unknown> {
  eventId: string;
  eventType: string;
  version: number;
  aggregateId: string;
  aggregateType: string;
  timestamp: Date;
  correlationId: string;
  causationId?: string;
  userId: string;
  organizationScope: {
    companyId: string;
    branchId?: string;
    factoryId?: string;
    departmentId?: string;
    [key: string]: string | undefined;
  };
  payload: T;
}

export interface EventHandler<T = unknown> {
  handle(event: DomainEvent<T>): Promise<void>;
}

export class EventBus {
  private readonly subscribers = new Map<string, EventHandler[]>();

  async publish<T>(event: DomainEvent<T>): Promise<void> {
    const handlers = this.subscribers.get(event.eventType) ?? [];
    await Promise.all(handlers.map((handler) => handler.handle(event)));
  }

  async publishAll<T>(events: DomainEvent<T>[]): Promise<void> {
    await Promise.all(events.map((event) => this.publish(event)));
  }

  subscribe(eventType: string, handler: EventHandler): void {
    const handlers = this.subscribers.get(eventType) ?? [];
    handlers.push(handler);
    this.subscribers.set(eventType, handlers);
  }

  unsubscribe(eventType: string, handler: EventHandler): void {
    const handlers = this.subscribers.get(eventType) ?? [];
    this.subscribers.set(eventType, handlers.filter((candidate) => candidate !== handler));
  }
}

export interface OutboxEvent {
  id: string;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  version: number;
  payload: Record<string, unknown>;
  createdAt: Date;
  publishedAt: Date | null;
}

export interface InboxEvent {
  id: string;
  eventId: string;
  eventType: string;
  consumer: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'DEAD_LETTER';
  processedAt: Date | null;
  retries: number;
  error: Record<string, unknown> | null;
  createdAt: Date;
}

export interface OutboxRepository {
  getUnpublished(limit: number): Promise<OutboxEvent[]>;
  markPublished(id: string): Promise<void>;
}

export interface InboxRepository {
  update(event: InboxEvent): Promise<void>;
  getPending(limit: number): Promise<InboxEvent[]>;
}
