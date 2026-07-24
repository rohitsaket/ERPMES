import { AggregateRoot } from '../aggregate-root';
import { DomainEvent } from '../aggregate-root';
import { WarehouseId } from '../value-objects';
import { InventoryLot } from './inventory-lot';
import { InventoryTransaction } from './inventory-transaction';

export class Warehouse extends AggregateRoot {
  private _id: WarehouseId;
  private _factoryId: string;
  private _name: string;
  private _type: WarehouseType;
  private _location: Location | null;
  private _deletedAt: Date | null = null;

  private constructor(
    id: WarehouseId,
    factoryId: string,
    name: string,
    type: WarehouseType,
    location: Location | null
  ) {
    super();
    this._id = id;
    this._factoryId = factoryId;
    this._name = name;
    this._type = type;
    this._location = location;
  }

  static create(
    factoryId: string,
    name: string,
    type: WarehouseType,
    location: Location | null
  ): Warehouse {
    const id = WarehouseId.generate();
    const warehouse = new Warehouse(id, factoryId, name, type, location);
    warehouse.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'WarehouseCreated',
      version: 1,
      aggregateId: id.value,
      aggregateType: 'Warehouse',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: '',
      organizationScope: { factoryId, warehouseId: id.value },
      payload: { name, type, location },
    });
    return warehouse;
  }

  static reconstruct(
    id: WarehouseId,
    factoryId: string,
    name: string,
    type: WarehouseType,
    location: Location | null,
    deletedAt: Date | null
  ): Warehouse {
    const warehouse = new Warehouse(id, factoryId, name, type, location);
    warehouse._deletedAt = deletedAt;
    return warehouse;
  }

  get id(): WarehouseId { return this._id; }
  get factoryId(): string { return this._factoryId; }
  get name(): string { return this._name; }
  get type(): WarehouseType { return this._type; }
  get location(): Location | null { return this._location; }
  get deletedAt(): Date | null { return this._deletedAt; }

  updateLocation(location: Location): void {
    this._location = location;
    this.incrementVersion();
  }

  updateType(type: WarehouseType): void {
    this._type = type;
    this.incrementVersion();
  }

  softDelete(): void {
    this._deletedAt = new Date();
    this.incrementVersion();
  }
}

export type WarehouseType = 'RAW' | 'FINISHED' | 'QUARANTINE' | 'TRANSIT' | 'WIP';

export interface Location {
  zone: string;
  aisle?: string;
  rack?: string;
  shelf?: string;
  bin?: string;
}