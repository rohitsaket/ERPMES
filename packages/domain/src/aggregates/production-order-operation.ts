import { DomainEvent } from '../aggregate-root';
import { DepartmentId, WorkCenterId } from '../value-objects';

export class ProductionOrderOperation {
  private _id: string;
  private _orderId: string;
  private _seq: number;
  private _departmentId: string;
  private _workCenterId: string | null;
  private _status: OperationStatus;
  private _setupMin: number;
  private _runMin: number;
  private _qtyComplete: number;
  private _qtyScrap: number;
  private _weightIn: number | null;
  private _weightOut: number | null;
  private _yieldPct: number | null;
  private _startedAt: Date | null;
  private _completedAt: Date | null;
  private _createdAt: Date;
  private _updatedAt: Date;

  private constructor(
    id: string,
    orderId: string,
    seq: number,
    departmentId: string,
    workCenterId: string | null,
    status: OperationStatus,
    setupMin: number,
    runMin: number,
    qtyComplete: number,
    qtyScrap: number,
    weightIn: number | null,
    weightOut: number | null,
    yieldPct: number | null,
    startedAt: Date | null,
    completedAt: Date | null,
    createdAt: Date,
    updatedAt: Date
  ) {
    this._id = id;
    this._orderId = orderId;
    this._seq = seq;
    this._departmentId = departmentId;
    this._workCenterId = workCenterId;
    this._status = status;
    this._setupMin = setupMin;
    this._runMin = runMin;
    this._qtyComplete = qtyComplete;
    this._qtyScrap = qtyScrap;
    this._weightIn = weightIn;
    this._weightOut = weightOut;
    this._yieldPct = yieldPct;
    this._startedAt = startedAt;
    this._completedAt = completedAt;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  static create(
    orderId: string,
    seq: number,
    departmentId: string,
    workCenterId: string | null,
    setupMin: number,
    runMin: number
  ): ProductionOrderOperation {
    const op = new ProductionOrderOperation(
      crypto.randomUUID(),
      orderId,
      seq,
      departmentId,
      null,
      'QUEUED',
      setupMin,
      0,
      0,
      0,
      null,
      null,
      null,
      null,
      null,
      new Date(),
      new Date()
    );
    op._workCenterId = workCenterId;
    return op;
  }

  static reconstruct(
    id: string,
    orderId: string,
    seq: number,
    departmentId: string,
    workCenterId: string | null,
    status: any,
    setupMin: number,
    runMin: number,
    qtyComplete: number,
    qtyScrap: number,
    weightIn: number | null,
    weightOut: number | null,
    yieldPct: number | null,
    startedAt: Date | null,
    completedAt: Date | null,
    createdAt: Date,
    updatedAt: Date
  ): ProductionOrderOperation {
    const op = new ProductionOrderOperation(
      id, orderId, seq, departmentId, workCenterId,
      status, setupMin, runMin, qtyComplete, qtyScrap,
      weightIn, weightOut, yieldPct, startedAt, completedAt,
      createdAt, updatedAt
    );
    return op;
  }

  get id(): string { return this._id; }
  get orderId(): string { return this._orderId; }
  get seq(): number { return this._seq; }
  get departmentId(): string { return this._departmentId; }
  get workCenterId(): string | null { return this._workCenterId; }
  get status(): string { return this._status; }
  get setupMin(): number { return this._setupMin; }
  get runMin(): number { return this._runMin; }
  get qtyComplete(): number { return this._qtyComplete; }
  get qtyScrap(): number { return this._qtyScrap; }
  get weightIn(): number | null { return this._weightIn; }
  get weightOut(): number | null { return this._weightOut; }
  get yieldPct(): number | null { return this._yieldPct; }
  get startedAt(): Date | null { return this._startedAt; }
  get completedAt(): Date | null { return this._completedAt; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  assignWorkCenter(workCenterId: string): void {
    this._workCenterId = workCenterId;
    this._updatedAt = new Date();
  }

  start(): void {
    if (this._status !== 'QUEUED') {
      throw new Error('Operation must be queued to start');
    }
    this._status = 'RUNNING';
    this._startedAt = new Date();
    this._updatedAt = new Date();
  }

  pause(): void {
    if (this._status !== 'RUNNING') {
      throw new Error('Operation must be running to pause');
    }
    this._status = 'PAUSED';
    this._updatedAt = new Date();
  }

  resume(): void {
    if (this._status !== 'PAUSED') {
      throw new Error('Operation must be paused to resume');
    }
    this._status = 'RUNNING';
    this._updatedAt = new Date();
  }

  transfer(toDeptId: string): void {
    if (this._status === 'COMPLETED') {
      throw new Error('Cannot transfer completed operation');
    }
    this._status = 'TRANSFERRED';
    this._updatedAt = new Date();
  }

  hold(): void {
    if (this._status !== 'RUNNING' && this._status !== 'PAUSED') {
      throw new Error('Operation must be running or paused to hold');
    }
    this._status = 'HELD';
    this._updatedAt = new Date();
  }

  complete(qtyGood: number, qtyScrap: number, weightIn: number, weightOut: number): void {
    if (this._status !== 'RUNNING' && this._status !== 'PAUSED') {
      throw new Error('Operation must be running or paused to complete');
    }
    this._status = 'COMPLETED';
    this._qtyComplete = qtyGood;
    this._qtyScrap = qtyScrap;
    this._weightIn = weightIn;
    this._weightOut = weightOut;
    this._yieldPct = weightIn > 0 ? (weightOut / weightIn) * 100 : 0;
    this._completedAt = new Date();
    this._updatedAt = new Date();
  }

  updateRunTime(runMin: number): void {
    this._runMin = runMin;
    this._updatedAt = new Date();
  }
}

export type OperationStatus = 'QUEUED' | 'RUNNING' | 'PAUSED' | 'TRANSFERRED' | 'HELD' | 'COMPLETED';