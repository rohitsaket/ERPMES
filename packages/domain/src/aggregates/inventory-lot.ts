import { AggregateRoot } from '../aggregate-root';
import { DomainEvent } from '../aggregate-root';
import { WarehouseId, InventoryLotId } from '../value-objects/ids';

export class InventoryLot extends AggregateRoot {
  private _id: string;
  private _companyId: string;
  private _itemId: string;
  private _itemName: string;
  private _warehouseId: string;
  private _qty: number;
  private _uom: string;
  private _status: InventoryLotStatus;
  private _lotNumber: string;
  private _expiryDate: Date | null;
  private _certificateId: string | null;
  private _deletedAt: Date | null = null;

  private constructor(
    id: string,
    companyId: string,
    itemId: string,
    itemName: string,
    warehouseId: string,
    qty: number,
    uom: string,
    status: InventoryLotStatus,
    lotNumber: string,
    expiryDate: Date | null,
    certificateId: string | null
  ) {
    super();
    this._id = id;
    this._companyId = companyId;
    this._itemId = itemId;
    this._itemName = itemName;
    this._warehouseId = warehouseId;
    this._qty = qty;
    this._uom = uom;
    this._status = status;
    this._lotNumber = lotNumber;
    this._expiryDate = expiryDate;
    this._certificateId = certificateId;
  }

  static create(
    companyId: string,
    itemId: string,
    itemName: string,
    warehouseId: string,
    qty: number,
    uom: string,
    lotNumber: string,
    expiryDate: Date | null,
    certificateId: string | null
  ): any {
    const id = crypto.randomUUID();
    const lot = new InventoryLot(id, companyId, itemId, itemName, warehouseId, qty, uom, 'AVAILABLE', lotNumber, expiryDate, certificateId);
    lot.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'InventoryLotCreated',
      version: 1,
      aggregateId: id,
      aggregateType: 'InventoryLot',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: '',
      organizationScope: { companyId, warehouseId, lotId: id },
      payload: { itemId, itemName, qty, uom, lotNumber, status: 'AVAILABLE' },
    });
    return lot;
  }

  static reconstruct(
    id: string,
    companyId: string,
    itemId: string,
    itemName: string,
    warehouseId: string,
    qty: number,
    uom: string,
    status: any,
    lotNumber: string,
    expiryDate: Date | null,
    certificateId: string | null,
    deletedAt: Date | null
  ): any {
    const lot = new InventoryLot(id, companyId, itemId, itemName, warehouseId, qty, uom, status, lotNumber, expiryDate, null);
    lot._certificateId = certificateId;
    lot._deletedAt = deletedAt;
    return lot;
  }

  get id(): string { return this._id; }
  get companyId(): string { return this._companyId; }
  get itemId(): string { return this._itemId; }
  get itemName(): string { return this._itemName; }
  get warehouseId(): string { return this._warehouseId; }
  get qty(): number { return this._qty; }
  get uom(): string { return this._uom; }
  get status(): string { return this._status; }
  get lotNumber(): string { return this._lotNumber; }
  get expiryDate(): Date | null { return this._expiryDate; }
  get certificateId(): string | null { return this._certificateId; }
  get deletedAt(): Date | null { return this._deletedAt; }

  adjustQty(delta: number, reason: string, employeeId: string): void {
    const newQty = this._qty + delta;
    if (newQty < 0) {
      throw new Error('Cannot reduce quantity below zero');
    }
    this._qty = newQty;
    this.incrementVersion();

    this.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'InventoryAdjusted',
      version: this.version,
      aggregateId: this._id,
      aggregateType: 'InventoryLot',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: employeeId,
      organizationScope: { companyId: this._companyId, warehouseId: this._warehouseId, lotId: this._id },
      payload: { delta, reason, newQty: this._qty },
    });
  }

  reserve(qty: number, salesOrderLineId: string, employeeId: string): void {
    if (this._status !== 'AVAILABLE') {
      throw new Error('Lot must be AVAILABLE to reserve');
    }
    if (qty > this._qty) {
      throw new Error('Cannot reserve more than available quantity');
    }
    this._status = 'RESERVED';
    this.incrementVersion();

    this.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'InventoryReserved',
      version: this.version,
      aggregateId: this._id,
      aggregateType: 'InventoryLot',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: employeeId,
      organizationScope: { companyId: this._companyId, warehouseId: this._warehouseId, lotId: this._id },
      payload: { qty, salesOrderLineId },
    });
  }

  releaseReservation(qty: number, employeeId: string): void {
    if (this._status !== 'RESERVED') {
      throw new Error('Lot must be RESERVED to release');
    }
    this._status = 'AVAILABLE';
    this.incrementVersion();

    this.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'InventoryReservationReleased',
      version: this.version,
      aggregateId: this._id,
      aggregateType: 'InventoryLot',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: employeeId,
      organizationScope: { companyId: this._companyId, warehouseId: this._warehouseId, lotId: this._id },
      payload: { qty },
    });
  }

  transfer(toWarehouseId: string, qty: number, employeeId: string): void {
    if (qty > this._qty) {
      throw new Error('Cannot transfer more than available quantity');
    }
    this._qty -= qty;
    this.incrementVersion();

    this.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'InventoryTransferred',
      version: this.version,
      aggregateId: this._id,
      aggregateType: 'InventoryLot',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: employeeId,
      organizationScope: { companyId: this._companyId, warehouseId: this._warehouseId, lotId: this._id },
      payload: { fromWarehouseId: this._warehouseId, toWarehouseId: toWarehouseId, qty },
    });
  }

  adjustQty(newQty: number, reason: string, employeeId: string): void {
    const delta = newQty - this._qty;
    this._qty = newQty;
    this.incrementVersion();

    this.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'InventoryAdjusted',
      version: this.version,
      aggregateId: this._id,
      aggregateType: 'InventoryLot',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: employeeId,
      organizationScope: { companyId: this._companyId, warehouseId: this._warehouseId, lotId: this._id },
      payload: { oldQty: this._qty - delta, newQty, reason },
    });
  }

  setCertificate(certificateId: string): void {
    this._certificateId = certificateId;
    this.incrementVersion();
  }

  softDelete(): void {
    this._deletedAt = new Date();
    this.incrementVersion();
  }
}

export type InventoryLotStatus = 'AVAILABLE' | 'RESERVED' | 'QUARANTINED' | 'BLOCKED' | 'EXPIRED';