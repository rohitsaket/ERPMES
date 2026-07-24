import type { DomainEvent } from '../../../domain/src/aggregate-root';

export class EventSerializer {
  serialize<T>(event: DomainEvent<T>): string {
    return JSON.stringify({
      eventId: event.eventId,
      eventType: event.eventType,
      version: event.version,
      aggregateId: event.aggregateId,
      aggregateType: event.aggregateType,
      timestamp: event.timestamp.toISOString(),
      correlationId: event.correlationId,
      causationId: event.causationId,
      userId: event.userId,
      organizationScope: event.organizationScope,
      payload: event.payload,
    });
  }

  deserialize<T>(data: string): DomainEvent<T> {
    const parsed = JSON.parse(data);
    return {
      ...parsed,
      timestamp: new Date(parsed.timestamp),
      organizationScope: parsed.organizationScope,
    } as DomainEvent<T>;
  }

  serializeBatch<T>(events: DomainEvent<T>[]): string {
    return JSON.stringify(events.map(e => this.serialize(e)));
  }

  deserializeBatch<T>(data: string): DomainEvent<T>[] {
    const parsed = JSON.parse(data);
    return parsed.map((e: any) => ({
      ...e,
      timestamp: new Date(e.timestamp),
      organizationScope: e.organizationScope,
    })) as DomainEvent<T>[];
  }
}

export class SchemaRegistry {
  private schemas: Map<string, any> = new Map();

  register(eventType: string, schema: any): void {
    this.schemas.set(eventType, schema);
  }

  getSchema(eventType: string): any | undefined {
    return this.schemas.get(eventType);
  }

  validate<T>(event: any): { valid: boolean; errors: string[] } {
    const schema = this.schemas.get(event.eventType);
    if (!schema) {
      return { valid: true, errors: [] }; // No schema registered, assume valid
    }

    // In a real implementation, use a JSON schema validator like AJV
    // For now, basic validation
    const errors: string[] = [];

    if (!event.eventId) errors.push('Missing eventId');
    if (!event.eventType) errors.push('Missing eventType');
    if (!event.aggregateId) errors.push('Missing aggregateId');
    if (!event.aggregateType) errors.push('Missing aggregateType');
    if (!event.timestamp) errors.push('Missing timestamp');
    if (!event.correlationId) errors.push('Missing correlationId');
    if (!event.userId) errors.push('Missing userId');
    if (!event.organizationScope) errors.push('Missing organizationScope');
    if (!event.payload) errors.push('Missing payload');

    return { valid: errors.length === 0, errors };
  }

  getRegisteredTypes(): string[] {
    return Array.from(this.schemas.keys());
  }
}

export const schemaRegistry = new SchemaRegistry();
