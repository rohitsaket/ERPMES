import { DomainEvent } from '../aggregate-root';
import { DepartmentId, WorkCenterId } from '../value-objects';

export class RoutingOperation {
  private _id: string;
  private _routingId: string;
  private _seq: number;
  private _departmentId: DepartmentId;
  private _workCenterType: string;
  private _setupMin: number;
  private _runMinPerUnit: number;
  private _queueMin: number;
  private _moveMin: number;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    id: string,
    routingId: string,
    seq: number,
    departmentId: DepartmentId,
    workCenterType: string,
    setupMin: number,
    runMinPerUnit: number,
    queueMin: number,
    moveMin: number
  ) {
    this._id = id;
    this._routingId = routingId;
    this._seq = seq;
    this._departmentId = departmentId;
    this._workCenterType = workCenterType;
    this._setupMin = setupMin;
    this._runMinPerUnit = runMinPerUnit;
    this._queueMin = queueMin;
    this._moveMin = moveMin;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  static create(
    routingId: string,
    seq: number,
    departmentId: DepartmentId,
    workCenterType: string,
    setupMin: number,
    runMinPerUnit: number,
    queueMin: number,
    moveMin: number
  ): RoutingOperation {
    return new RoutingOperation(
      crypto.randomUUID(),
      routingId,
      seq,
      departmentId,
      workCenterType,
      setupMin,
      runMinPerUnit,
      queueMin,
      moveMin
    );
  }

  static reconstruct(
    id: string,
    routingId: string,
    seq: number,
    departmentId: DepartmentId,
    workCenterType: string,
    setupMin: number,
    runMinPerUnit: number,
    queueMin: number,
    moveMin: number,
    createdAt: Date,
    updatedAt: Date
  ): RoutingOperation {
    const op = new RoutingOperation(
      id, routingId, seq, departmentId, workCenterType,
      setupMin, runMinPerUnit, queueMin, moveMin
    );
    op._createdAt = createdAt;
    op._updatedAt = updatedAt;
    return op;
  }

  get id(): string { return this._id; }
  get routingId(): string { return this._routingId; }
  get seq(): number { return this._seq; }
  get departmentId(): DepartmentId { return this._departmentId; }
  get workCenterType(): string { return this._workCenterType; }
  get setupMin(): number { return this._setupMin; }
  get runMinPerUnit(): number { return this._runMinPerUnit; }
  get queueMin(): number { return this._queueMin; }
  get moveMin(): number { return this._moveMin; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  update(
    departmentId: DepartmentId,
    workCenterType: string,
    setupMin: number,
    runMinPerUnit: number,
    queueMin: number,
    moveMin: number
  ): void {
    this._departmentId = departmentId;
    this._workCenterType = workCenterType;
    this._setupMin = setupMin;
    this._runMinPerUnit = runMinPerUnit;
    this._queueMin = queueMin;
    this._moveMin = moveMin;
    this._updatedAt = new Date();
  }

  get totalMinPerUnit(): number {
    return this._setupMin + this._runMinPerUnit + this._queueMin + this._moveMin;
  }
}