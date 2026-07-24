import { AggregateRoot } from '../aggregate-root';
import { DomainEvent } from '../aggregate-root';
import { WorkCenterId } from '../value-objects';
import { ProductionOrderOperation } from './production-order-operation';

export class WorkCenter extends AggregateRoot {
  private _id: WorkCenterId;
  private _departmentId: string;
  private _name: string;
  private _type: WorkCenterType;
  private _capacity: number;
  private _oeeTarget: number;
  private _deletedAt: Date | null = null;

  private constructor(
    id: WorkCenterId,
    departmentId: string,
    name: string,
    type: WorkCenterType,
    capacity: number,
    oeeTarget: number
  ) {
    super();
    this._id = id;
    this._departmentId = departmentId;
    this._name = name;
    this._type = type;
    this._capacity = capacity;
    this._oeeTarget = oeeTarget;
  }

  static create(
    departmentId: string,
    name: string,
    type: WorkCenterType,
    capacity: number,
    oeeTarget: number = 0.85
  ): WorkCenter {
    const id = WorkCenterId.generate();
    const workCenter = new WorkCenter(id, departmentId, name, type, capacity, oeeTarget);
    workCenter.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'WorkCenterCreated',
      version: 1,
      aggregateId: id.value,
      aggregateType: 'WorkCenter',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: '',
      organizationScope: { departmentId, workCenterId: id.value },
      payload: { departmentId, name, type, capacity, oeeTarget },
    });
    return workCenter;
  }

  static reconstruct(
    id: WorkCenterId,
    departmentId: string,
    name: string,
    type: WorkCenterType,
    capacity: number,
    oeeTarget: number,
    deletedAt: Date | null
  ): WorkCenter {
    const workCenter = new WorkCenter(id, departmentId, name, type, capacity, oeeTarget);
    workCenter._deletedAt = deletedAt;
    return workCenter;
  }

  get id(): WorkCenterId { return this._id; }
  get departmentId(): string { return this._departmentId; }
  get name(): string { return this._name; }
  get type(): WorkCenterType { return this._type; }
  get capacity(): number { return this._capacity; }
  get oeeTarget(): number { return this._oeeTarget; }
  get deletedAt(): Date | null { return this._deletedAt; }

  updateCapacity(capacity: number): void {
    this._capacity = capacity;
    this.incrementVersion();
  }

  updateOeeTarget(oeeTarget: number): void {
    this._oeeTarget = oeeTarget;
    this.incrementVersion();
  }

  updateType(type: WorkCenterType): void {
    this._type = type;
    this.incrementVersion();
  }

  softDelete(): void {
    this._deletedAt = new Date();
    this.incrementVersion();
  }
}

export type WorkCenterType = 'MACHINE' | 'LABOR' | 'MIXED';