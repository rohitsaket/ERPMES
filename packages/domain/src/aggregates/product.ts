import { AggregateRoot } from '../aggregate-root';
import { DomainEvent } from '../aggregate-root';
import { ProductId } from '../value-objects';
import { BomLine } from './bom-line';
import { RoutingOperation } from './routing-operation';
import { RoutingConfig } from './routing-config';

export class Product extends AggregateRoot {
  private _id: ProductId;
  private _companyId: string;
  private _sku: string;
  private _name: string;
  private _category: string;
  private _description: string | null;
  private _bomId: string | null;
  private _routingId: string | null;
  private _bomLines: Map<string, BomLine> = new Map();
  private _routingOperations: Map<string, RoutingOperation> = new Map();
  private _routingConfigs: Map<string, RoutingConfig> = new Map();
  private _deletedAt: Date | null = null;

  private constructor(
    id: ProductId,
    companyId: string,
    sku: string,
    name: string,
    category: string,
    description: string | null,
    bomId: string | null,
    routingId: string | null
  ) {
    super();
    this._id = id;
    this._companyId = companyId;
    this._sku = sku;
    this._name = name;
    this._category = category;
    this._description = description;
    this._bomId = bomId;
    this._routingId = routingId;
  }

  static create(
    companyId: string,
    sku: string,
    name: string,
    category: string,
    description: string | null = null
  ): Product {
    const id = ProductId.generate();
    const product = new Product(id, companyId, sku, name, category, description, null, null);
    product.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'ProductCreated',
      version: 1,
      aggregateId: id.value,
      aggregateType: 'Product',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: '',
      organizationScope: { companyId, productId: id.value },
      payload: { sku, name, category, description },
    });
    return product;
  }

  static reconstruct(
    id: ProductId,
    companyId: string,
    sku: string,
    name: string,
    category: string,
    description: string | null,
    bomId: string | null,
    routingId: string | null,
    bomLines: BomLine[],
    routingOperations: RoutingOperation[],
    routingConfigs: RoutingConfig[],
    deletedAt: Date | null
  ): Product {
    const product = new Product(id, companyId, sku, name, category, description, bomId, routingId);
    product._bomLines = new Map(bomLines.map(bl => [bl.itemId, bl]));
    product._routingOperations = new Map(routingOperations.map(ro => [ro.seq.toString(), ro]));
    product._routingConfigs = new Map(routingConfigs.map(rc => [rc.id.value, rc]));
    product._deletedAt = deletedAt;
    return product;
  }

  get id(): ProductId { return this._id; }
  get companyId(): string { return this._companyId; }
  get sku(): string { return this._sku; }
  get name(): string { return this._name; }
  get category(): string { return this._category; }
  get description(): string | null { return this._description; }
  get bomId(): string | null { return this._bomId; }
  get routingId(): string | null { return this._routingId; }
  get bomLines(): BomLine[] { return Array.from(this._bomLines.values()); }
  get routingOperations(): RoutingOperation[] { return Array.from(this._routingOperations.values()); }
  get routingConfigs(): RoutingConfig[] { return Array.from(this._routingConfigs.values()); }
  get deletedAt(): Date | null { return this._deletedAt; }

  setBom(bomId: string): void {
    this._bomId = bomId;
    this.incrementVersion();
  }

  setRouting(routingId: string): void {
    this._routingId = routingId;
    this.incrementVersion();
  }

  addBomLine(bomLine: BomLine): void {
    this._bomLines.set(bomLine.itemId, bomLine);
    this.incrementVersion();
  }

  removeBomLine(itemId: string): void {
    this._bomLines.delete(itemId);
    this.incrementVersion();
  }

  addRoutingOperation(operation: RoutingOperation): void {
    this._routingOperations.set(operation.seq.toString(), operation);
    this.incrementVersion();
  }

  removeRoutingOperation(seq: number): void {
    this._routingOperations.delete(seq.toString());
    this.incrementVersion();
  }

  addRoutingConfig(config: RoutingConfig): void {
    this._routingConfigs.set(config.id.value, config);
    this.incrementVersion();
  }

  updateName(name: string): void {
    this._name = name;
    this.incrementVersion();
  }

  updateDescription(description: string | null): void {
    this._description = description;
    this.incrementVersion();
  }

  updateCategory(category: string): void {
    this._category = category;
    this.incrementVersion();
  }

  softDelete(): void {
    this._deletedAt = new Date();
    this.incrementVersion();
  }
}