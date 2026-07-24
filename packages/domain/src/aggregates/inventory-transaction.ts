import { AggregateRoot } from '../aggregate-root';
import { DomainEvent } from '../aggregate-root';
import { InventoryLotId } from '../value-objects/ids';

export class InventoryTransaction extends AggregateRoot {
  private _id: string;
  private _lotId: string;
  private _type: TransactionType;
  private _qty: number;
  private _uom: string;
  private _refType: string | null;
  private _refId: string | null;
  private _fromLocation: string | null;
  private _toLocation: string | null;
  private _employeeId: string | null;
  private _weightBefore: number | null;
  private _weightAfter: number | null;
  private _createdAt: Date;

  private constructor(
    id: string,
    lotId: string,
    type: TransactionType,
    qty: number,
    uom: string,
    refType: string | null,
    refId: string | null,
    fromLocation: string | null,
    toLocation: string | null,
    employeeId: string | null,
    weightBefore: number | null,
    weightAfter: number | null
  ) {
    super();
    this._id = id;
    this._lotId = lotId;
    this._type = type;
    this._qty = qty;
    this._uom = uom;
    this._refType = refType;
    this._refId = refId;
    this._fromLocation = fromLocation;
    this._toLocation = toLocation;
    this._employeeId = employeeId;
    this._weightBefore = weightBefore;
    this._weightAfter = weightAfter;
    this._createdAt = new Date();
  }

  static create(
    lotId: string,
    type: TransactionType,
    qty: number,
    uom: string,
    refType: string | null,
    refId: string | null,
    fromLocation: string | null,
    toLocation: string | null,
    employeeId: string | null,
    weightBefore: number | null,
    weightAfter: number | null
  ): any {
    const id = crypto.randomUUID();
    const txn = new InventoryTransaction(id, lotId, type, qty, uom, refType, refId, fromLocation, toLocation, employeeId, weightBefore, weightAfter);
    txn.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'InventoryTransactionCreated',
      version: 1,
      aggregateId: id,
      aggregateType: 'InventoryTransaction',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: employeeId || '',
      organizationScope: { lotId },
      payload: { type, qty, uom, refType, refId, fromLocation, toLocation, employeeId },
    });
    return txn;
  }

  static reconstruct(
    id: string,
    lotId: string,
    type: any,
    qty: number,
    uom: string,
    refType: string | null,
    refId: string | null,
    fromLocation: string | null,
    toLocation: string | null,
    employeeId: string | null,
    weightBefore: number | null,
    weightAfter: number | null,
    createdAt: Date
  ): any {
    const txn = new InventoryTransaction(id, lotId, type, qty, uom, refType, refId, fromLocation, toLocation, employeeId, weightBefore, weightAfter);
    txn._createdAt = createdAt;
    return txn;
  }

  get id(): string { return this._id; }
  get lotId(): string { return this._lotId; }
  get type(): string { return this._type; }
  get qty(): number { return this._qty; }
  get uom(): string { return this._uom; }
  get refType(): string | null { return this._refType; }
  get refId(): string | null { return this._refId; }
  get fromLocation(): string | null { return this._fromLocation; }
  get toLocation(): string | null { return this._toLocation; }
  get employeeId(): string | null { return this._employeeId; }
  get weightBefore(): number | null { return this._weightBefore; }
  get weightAfter(): number | null { return this._weightAfter; }
  get createdAt(): Date { return this._createdAt; }
}

export type TransactionType = 
  | 'RECEIPT' 
  | 'ISSUE' 
  | 'TRANSFER_IN' 
  | 'TRANSFER_OUT' 
  | 'ADJUSTMENT' 
  | 'RESERVATION' 
  | 'RELEASE';