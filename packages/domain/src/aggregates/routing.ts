import { AggregateRoot } from '../aggregate-root';
import { DomainEvent } from '../aggregate-root';
import { RoutingId } from '../value-objects';
import { RoutingOperation } from './routing-operation';
import { RoutingConfig } from './routing-config';

export class Routing extends AggregateRoot {
  private _id: RoutingId;
  private _productId: string;
  private _version: number;
  private _operations: Map<string, RoutingOperation> = new Map();
  private _configs: RoutingConfig[] = [];
  private _deletedAt: Date | null = null;

  private constructor(
    id: RoutingId,
    productId: string,
    version: number
  ) {
    super();
    this._id = id;
    this._productId = productId;
    this._version = version;
  }

  static create(productId: string): Routing {
    const id = RoutingId.generate();
    const routing = new Routing(id, productId, 1);
    routing.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'RoutingCreated',
      version: 1,
      aggregateId: id.value,
      aggregateType: 'Routing',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: '',
      organizationScope: { productId, routingId: id.value },
      payload: { productId },
    });
    return routing;
  }

  static reconstruct(
    id: RoutingId,
    productId: string,
    version: number,
    operations: Map<string, RoutingOperation>,
    configs: RoutingConfig[],
    deletedAt: Date | null
  ): Routing {
    const routing = new Routing(id, productId, version);
    routing._operations = operations;
    routing._configs = configs;
    routing._deletedAt = deletedAt;
    return routing;
  }

  get id(): RoutingId { return this._id; }
  get productId(): string { return this._productId; }
  get version(): number { return this._version; }
  get operations(): Map<string, RoutingOperation> { return this._operations; }
  get operationList(): RoutingOperation[] { return Array.from(this._operations.values()); }
  get configs(): RoutingConfig[] { return [...this._configs]; }
  get deletedAt(): Date | null { return this._deletedAt; }

  addOperation(operation: RoutingOperation): void {
    if (this._operations.has(operation.id.value)) {
      throw new Error(`Operation with id ${operation.id.value} already exists`);
    }
    this._operations.set(operation.id.value, operation);
    this.incrementVersion();
  }

  removeOperation(operationId: string): void {
    this._operations.delete(operationId);
    this.incrementVersion();
  }

  addConfig(config: RoutingConfig): void {
    this._configs.push(config);
    this.incrementVersion();
  }

  removeConfig(configId: string): void {
    this._configs = this._configs.filter(c => c.id.value !== configId);
    this.incrementVersion();
  }

  createNewVersion(): Routing {
    const newRouting = Routing.create(this._productId);
    newRouting._operations = new Map(this._operations);
    newRouting._configs = [...this._configs];
    newRouting._version = this._version + 1;
    return newRouting;
  }

  selectConfig(
    companyId: string | null,
    factoryId: string | null,
    productId: string | null,
    diamondType: string | null,
    shape: string | null,
    customerId: string | null,
    orderType: string | null,
    method: string | null,
    priority: string | null,
    qualityReq: string | null
  ): RoutingConfig | null {
    // Sort configs by specificity (most specific first)
    const sortedConfigs = [...this._configs].sort((a, b) => {
      const aScore = a.getSpecificityScore();
      const bScore = b.getSpecificityScore();
      return bScore - aScore;
    });

    for (const config of sortedConfigs) {
      if (config.matches(
        companyId, factoryId, productId, diamondType, shape,
        customerId, orderType, method, priority, qualityReq
      )) {
        return config;
      }
    }
    return null;
  }

  softDelete(): void {
    this._deletedAt = new Date();
    this.incrementVersion();
  }
}