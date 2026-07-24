import { AggregateRoot } from '../aggregate-root';
import { DomainEvent } from '../aggregate-root';
import { DepartmentId } from '../value-objects';
import { WorkCenter } from './work-center';
import { RoutingOperation } from './routing-operation';

export class Department extends AggregateRoot {
  private _id: DepartmentId;
  private _factoryId: string;
  private _name: string;
  private _type: DepartmentType;
  private _sequence: number;
  private _capacity: number;
  private _workCenters: Map<string, WorkCenter> = new Map();
  private _routingOperations: Map<string, RoutingOperation> = new Map();
  private _deletedAt: Date | null = null;

  private constructor(
    id: DepartmentId,
    factoryId: string,
    name: string,
    type: DepartmentType,
    sequence: number,
    capacity: number
  ) {
    super();
    this._id = id;
    this._factoryId = factoryId;
    this._name = name;
    this._type = type;
    this._sequence = sequence;
    this._capacity = capacity;
  }

  static create(
    factoryId: string,
    name: string,
    type: DepartmentType,
    sequence: number,
    capacity: number
  ): Department {
    const id = DepartmentId.generate();
    const department = new Department(id, factoryId, name, type, sequence, capacity);
    department.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'DepartmentCreated',
      version: 1,
      aggregateId: id.value,
      aggregateType: 'Department',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: '',
      organizationScope: { factoryId, departmentId: id.value },
      payload: { factoryId, name, type, sequence, capacity },
    });
    return department;
  }

  static reconstruct(
    id: DepartmentId,
    factoryId: string,
    name: string,
    type: DepartmentType,
    sequence: number,
    capacity: number,
    workCenters: WorkCenter[],
    routingOperations: RoutingOperation[],
    deletedAt: Date | null
  ): Department {
    const department = new Department(id, factoryId, name, type, sequence, capacity);
    department._workCenters = new Map(workCenters.map(wc => [wc.id.value, wc]));
    department._routingOperations = new Map(routingOperations.map(ro => [ro.id.value, ro]));
    department._deletedAt = deletedAt;
    return department;
  }

  get id(): DepartmentId { return this._id; }
  get factoryId(): string { return this._factoryId; }
  get name(): string { return this._name; }
  get type(): DepartmentType { return this._type; }
  get sequence(): number { return this._sequence; }
  get capacity(): number { return this._capacity; }
  get workCenters(): WorkCenter[] { return Array.from(this._workCenters.values()); }
  get routingOperations(): RoutingOperation[] { return Array.from(this._routingOperations.values()); }
  get deletedAt(): Date | null { return this._deletedAt; }

  addWorkCenter(workCenter: WorkCenter): void {
    this._workCenters.set(workCenter.id.value, workCenter);
    this.incrementVersion();
  }

  removeWorkCenter(workCenterId: string): void {
    this._workCenters.delete(workCenterId);
    this.incrementVersion();
  }

  addRoutingOperation(operation: RoutingOperation): void {
    this._routingOperations.set(operation.id.value, operation);
    this.incrementVersion();
  }

  removeRoutingOperation(operationId: string): void {
    this._routingOperations.delete(operationId);
    this.incrementVersion();
  }

  updateCapacity(capacity: number): void {
    this._capacity = capacity;
    this.incrementVersion();
  }

  updateSequence(sequence: number): void {
    this._sequence = sequence;
    this.incrementVersion();
  }

  softDelete(): void {
    this._deletedAt = new Date();
    this.incrementVersion();
  }
}

export type DepartmentType = 
  | 'PLANNING' 
  | 'ROUGH' 
  | 'SAWING' 
  | 'LASER' 
  | 'BLOCKING' 
  | 'BRUTING' 
  | 'POLISHING' 
  | 'FANCY' 
  | 'REPAIR' 
  | 'QC' 
  | 'CERTIFICATION' 
  | 'BAGGING' 
  | 'DISPATCH';