import { AggregateRoot } from '../aggregate-root';
import { DomainEvent } from '../aggregate-root';
import { ProductId, CustomerId } from '../value-objects';
import { SalesOrderLine } from './sales-order-line';

export class SalesOrder extends AggregateRoot {
  private _id: string;
  private _companyId: string;
  private _customerId: CustomerId;
  private _quotationId: string | null;
  private _status: SalesOrderStatus;
  private _orderDate: Date;
  private _requiredDate: Date | null;
  private _lines: Map<string, SalesOrderLine> = new Map();
  private _productionOrders: string[] = [];
  private _invoices: string[] = [];
  private _deletedAt: Date | null = null;

  private constructor(
    id: string,
    companyId: string,
    customerId: CustomerId,
    quotationId: string | null,
    status: SalesOrderStatus,
    orderDate: Date,
    requiredDate: Date | null
  ) {
    super();
    this._id = id;
    this._companyId = companyId;
    this._customerId = customerId;
    this._quotationId = quotationId;
    this._status = status;
    this._orderDate = orderDate;
    this._requiredDate = requiredDate;
  }

  static create(
    companyId: string,
    customerId: CustomerId,
    quotationId: string | null,
    orderDate: Date,
    requiredDate: Date | null
  ): SalesOrder {
    const id = crypto.randomUUID();
    const order = new SalesOrder(id, companyId, quotationId, 'DRAFT', orderDate, requiredDate);
    order.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'SalesOrderCreated',
      version: 1,
      aggregateId: id,
      aggregateType: 'SalesOrder',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: '',
      organizationScope: { companyId },
      payload: { customerId: quotationId, orderDate, requiredDate },
    });
    return order;
  }

  static reconstruct(
    id: string,
    companyId: string,
    customerId: CustomerId,
    quotationId: string | null,
    status: SalesOrderStatus,
    orderDate: Date,
    requiredDate: Date | null,
    lines: Map<string, any>,
    productionOrders: string[],
    invoices: string[],
    deletedAt: Date | null
  ): SalesOrder {
    const order = new SalesOrder(id, companyId, customerId, null, status, new Date(), null);
    order._lines = lines;
    order._productionOrders = productionOrders;
    order._invoices = invoices;
    order._deletedAt = deletedAt;
    return order;
  }

  get id(): string { return this._id; }
  get companyId(): string { return this._companyId; }
  get customerId(): CustomerId { return this._customerId; }
  get quotationId(): string | null { return this._quotationId; }
  get status(): SalesOrderStatus { return this._status; }
  get orderDate(): Date { return this._orderDate; }
  get requiredDate(): Date | null { return this._requiredDate; }
  get lines(): any[] { return Array.from(this._lines.values()); }
  get productionOrders(): string[] { return [...this._productionOrders]; }
  get invoices(): string[] { return [...this._invoices]; }
  get deletedAt(): Date | null { return this._deletedAt; }

  addLine(line: any): void {
    if (this._lines.has(line.id)) {
      throw new Error(`Line with id ${line.id} already exists`);
    }
    this._lines.set(line.id, line);
    this.incrementVersion();
  }

  removeLine(lineId: string): void {
    this._lines.delete(lineId);
    this.incrementVersion();
  }

  validate(): void {
    if (this._status !== 'DRAFT') {
      throw new Error('Order must be in DRAFT status to validate');
    }
    if (this._lines.size === 0) {
      throw new Error('Order must have at least one line');
    }
    this._status = 'VALIDATED';
    this.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'SalesOrderValidated',
      version: this.version,
      aggregateId: this._id,
      aggregateType: 'SalesOrder',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: '',
      organizationScope: { companyId: this._companyId },
      payload: { orderId: this._id },
    });
    this.incrementVersion();
  }

  release(): void {
    if (this._status !== 'VALIDATED') {
      throw new Error('Order must be validated before release');
    }
    this._status = 'RELEASED';
    this.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'SalesOrderReleased',
      version: this.version,
      aggregateId: this._id,
      aggregateType: 'SalesOrder',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: '',
      organizationScope: { companyId: this._companyId },
      payload: { orderId: this._id },
    });
    this.incrementVersion();
  }

  addProductionOrder(productionOrderId: string): void {
    this._productionOrders.push(productionOrderId);
    this.incrementVersion();
  }

  addInvoice(invoiceId: string): void {
    this._invoices.push(invoiceId);
    this.incrementVersion();
  }

  complete(): void {
    this._status = 'COMPLETED';
    this.incrementVersion();
  }

  cancel(): void {
    if (this._status === 'COMPLETED') {
      throw new Error('Cannot cancel completed order');
    }
    this._status = 'CANCELLED';
    this.incrementVersion();
  }

  softDelete(): void {
    this._deletedAt = new Date();
    this.incrementVersion();
  }
}

export type SalesOrderStatus = 'DRAFT' | 'VALIDATED' | 'RELEASED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';