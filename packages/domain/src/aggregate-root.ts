export abstract class AggregateRoot {
  private _domainEvents: DomainEvent[] = [];
  protected _version = 0;

  get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  get version(): number {
    return this._version;
  }

  protected addEvent<T>(event: DomainEvent<T>): void {
    this._domainEvents.push(event);
  }

  clearEvents(): void {
    this._domainEvents = [];
  }

  protected incrementVersion(): void {
    this._version++;
  }
}

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
  organizationScope: OrganizationScope;
  payload: T;
}

export interface OrganizationScope {
  companyId: string;
  branchId?: string;
  factoryId?: string;
  departmentId?: string;
}

export interface EventHandler<T = unknown> {
  handle(event: DomainEvent<T>): Promise<void>;
}

export interface EventPublisher {
  publish<T>(event: DomainEvent<T>): Promise<void>;
}

export interface EventSubscriber {
  subscribe(eventType: string, handler: EventHandler): void;
  unsubscribe(eventType: string, handler: EventHandler): void;
}