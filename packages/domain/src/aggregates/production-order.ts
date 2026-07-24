import { AggregateRoot } from '../aggregate-root';
import { DomainEvent } from '../aggregate-root';
import { ProductId } from '../value-objects';
import { ProductionOrderOperation } from './production-order-operation';
import { JobCard } from './job-card';

export class ProductionOrder extends AggregateRoot {
  private _id: string;
  private _companyId: string;
  private _salesOrderLineId: string | null;
  private _productId: ProductId;
  private _qty: number;
  private _status: ProductionOrderStatus;
  private _priority: number;
  private _startDate: Date | null;
  private _dueDate: Date | null;
  private _routingId: string | null;
  private _operations: Map<string, ProductionOrderOperation> = new Map();
  private _jobCards: Map<string, JobCard> = new Map();
  private _deletedAt: Date | null = null;

  private constructor(
    id: string,
    companyId: string,
    salesOrderLineId: string | null,
    productId: ProductId,
    qty: number,
    status: ProductionOrderStatus,
    priority: number,
    startDate: Date | null,
    dueDate: Date | null,
    routingId: string | null
  ) {
    super();
    this._id = id;
    this._companyId = companyId;
    this._salesOrderLineId = salesOrderLineId;
    this._productId = productId;
    this._qty = qty;
    this._status = status;
    this._priority = priority;
    this._startDate = startDate;
    this._dueDate = dueDate;
    this._routingId = routingId;
  }

  static create(
    companyId: string,
    salesOrderLineId: string | null,
    productId: ProductId,
    qty: number,
    priority: number,
    startDate: Date | null,
    dueDate: Date | null,
    routingId: string | null
  ): ProductionOrder {
    const id = crypto.randomUUID();
    const order = new ProductionOrder(
      id, companyId, salesOrderLineId, productId, qty,
      'PLANNED', priority, startDate, dueDate, null
    );
    order.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'ProductionOrderCreated',
      version: 1,
      aggregateId: id,
      aggregateType: 'ProductionOrder',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: '',
      organizationScope: { companyId },
      payload: { productId: productId.value, qty, priority, startDate, dueDate },
    });
    return order;
  }

  static reconstruct(
    id: string,
    companyId: string,
    salesOrderLineId: string | null,
    productId: ProductId,
    qty: number,
    status: ProductionOrderStatus,
    priority: number,
    startDate: Date | null,
    dueDate: Date | null,
    routingId: string | null,
    operations: Map<string, ProductionOrderOperation>,
    jobCards: Map<string, JobCard>,
    deletedAt: Date | null
  ): ProductionOrder {
    const order = new ProductionOrder(
      id, companyId, salesOrderLineId, productId, qty,
      status, priority, startDate, dueDate, routingId
    );
    order._operations = operations;
    order._jobCards = jobCards;
    order._deletedAt = deletedAt;
    return order;
  }

  get id(): string { return this._id; }
  get companyId(): string { return this._companyId; }
  get salesOrderLineId(): string | null { return this._salesOrderLineId; }
  get productId(): ProductId { return this._productId; }
  get qty(): number { return this._qty; }
  get status(): ProductionOrderStatus { return this._status; }
  get priority(): number { return this._priority; }
  get startDate(): Date | null { return this._startDate; }
  get dueDate(): Date | null { return this._dueDate; }
  get routingId(): string | null { return this._routingId; }
  get operations(): ProductionOrderOperation[] { return Array.from(this._operations.values()); }
  get jobCards(): JobCard[] { return Array.from(this._jobCards.values()); }
  get deletedAt(): Date | null { return this._deletedAt; }

  addOperation(operation: ProductionOrderOperation): void {
    if (this._operations.has(operation.id)) {
      throw new Error(`Operation with id ${operation.id} already exists`);
    }
    this._operations.set(operation.id, operation);
    this.incrementVersion();
  }

  removeOperation(operationId: string): void {
    this._operations.delete(operationId);
    this.incrementVersion();
  }

  addJobCard(jobCard: JobCard): void {
    this._jobCards.set(jobCard.id, jobCard);
    this.incrementVersion();
  }

  release(): void {
    if (this._status !== 'PLANNED') {
      throw new Error('Order must be in PLANNED status to release');
    }
    this._status = 'RELEASED';
    this.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'ProductionOrderReleased',
      version: this.version,
      aggregateId: this._id,
      aggregateType: 'ProductionOrder',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: '',
      organizationScope: { companyId: this._companyId },
      payload: { orderId: this._id },
    });
    this.incrementVersion();
  }

  start(): void {
    if (this._status !== 'RELEASED') {
      throw new Error('Order must be released before starting');
    }
    this._status = 'IN_PROGRESS';
    this.incrementVersion();
  }

  complete(): void {
    if (this._status !== 'IN_PROGRESS') {
      throw new Error('Order must be in progress to complete');
    }
    if (this._operations.size === 0) {
      throw new Error('Cannot complete order with no operations');
    }
    for (const op of this._operations.values()) {
      if (op.status !== 'COMPLETED') {
        throw new Error('All operations must be completed before completing order');
      }
    }
    this._status = 'COMPLETED';
    this.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'ProductionOrderCompleted',
      version: this.version,
      aggregateId: this._id,
      aggregateType: 'ProductionOrder',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: '',
      organizationScope: { companyId: this._companyId },
      payload: { orderId: this._id },
    });
    this.incrementVersion();
  }

  close(): void {
    this._status = 'CLOSED';
    this.incrementVersion();
  }

  setRouting(routingId: string): void {
    this._routingId = routingId;
    this.incrementVersion();
  }

  setStartDate(date: Date): void {
    this._startDate = date;
    this.incrementVersion();
  }

  setDueDate(date: Date): void {
    this._dueDate = date;
    this.incrementVersion();
  }

  setPriority(priority: number): void {
    this._priority = priority;
    this.incrementVersion();
  }

  softDelete(): void {
    this._deletedAt = new Date();
    this.incrementVersion();
  }
}

export type ProductionOrderStatus = 'PLANNED' | 'RELEASED' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED' | 'CANCELLED';