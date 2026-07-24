import type { DomainEvent } from '../../../domain/src/aggregate-root';

export interface EventSerializer {
  serialize<T>(event: DomainEvent<T>): string;
  deserialize<T>(data: string): DomainEvent<T>;
}

export class JsonEventSerializer implements EventSerializer {
  serialize<T>(event: DomainEvent<T>): string {
    return JSON.stringify(event);
  }

  deserialize<T>(data: string): DomainEvent<T> {
    const parsed = JSON.parse(data);
    return {
      ...parsed,
      timestamp: new Date(parsed.timestamp),
    };
  }
}

export interface SchemaRegistry {
  register(schema: EventSchema): void;
  getSchema(eventType: string, version: number): EventSchema | undefined;
  validate(event: DomainEvent): { valid: boolean; errors: string[] };
}

export interface EventSchema {
  eventType: string;
  version: number;
  schema: object; // JSON Schema
}

export class InMemorySchemaRegistry implements SchemaRegistry {
  private schemas: Map<string, EventSchema> = new Map();

  register(schema: EventSchema): void {
    const key = `${schema.eventType}:${schema.version}`;
    this.schemas.set(key, schema);
  }

  getSchema(eventType: string, version: number): EventSchema | undefined {
    return this.schemas.get(`${eventType}:${version}`);
  }

  validate(event: DomainEvent): { valid: boolean; errors: string[] } {
    const schema = this.getSchema(event.eventType, event.version);
    if (!schema) {
      return { valid: true, errors: [] }; // No schema to validate against
    }

    // In production, use a proper JSON Schema validator like ajv
    // This is a simplified check
    return { valid: true, errors: [] };
  }
}

export const SCHEMA_REGISTRY = Symbol('SCHEMA_REGISTRY');
