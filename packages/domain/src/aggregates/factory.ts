import { AggregateRoot } from '../aggregate-root';
import { DomainEvent } from '../aggregate-root';
import { FactoryId, DepartmentId, WorkCenterId, DiamondPacketId } from '../value-objects/ids';

export class Factory extends AggregateRoot {
  private _id: FactoryId;
  private _branchId: string;
  private _companyId: string;
  private _name: string;
  private _code: string;
  private _capacity: number;
  private _shifts: Shift[];
  private _departments: Map<string, any> = new Map();
  private _workCenters: Map<string, any> = new Map();
  private _packets: Map<string, any> = new Map();
  private _deletedAt: Date | null = null;

  private constructor(
    id: FactoryId,
    companyId: string,
    branchId: string,
    name: string,
    code: string,
    capacity: number,
    shifts: Shift[]
  ) {
    super();
    this._id = id;
    this._companyId = companyId;
    this._branchId = branchId;
    this._name = name;
    this._code = code;
    this._capacity = capacity;
    this._shifts = shifts;
  }

  static create(
    branchId: string,
    companyId: string,
    name: string,
    code: string,
    capacity: number,
    shifts: Shift[]
  ): Factory {
    const id = FactoryId.generate();
    const factory = new Factory(id, companyId, branchId, name, code, capacity, shifts);
    factory.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'FactoryCreated',
      version: 1,
      aggregateId: id.value,
      aggregateType: 'Factory',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: '',
      organizationScope: { companyId, factoryId: id.value },
      payload: { branchId, name, code, capacity, shifts },
    });
    return factory;
  }

  static reconstruct(
    id: FactoryId,
    companyId: string,
    branchId: string,
    name: string,
    code: string,
    capacity: number,
    shifts: Shift[],
    departments: any[],
    workCenters: any[],
    packets: any[],
    deletedAt: Date | null
  ): Factory {
    const factory = new Factory(id, companyId, branchId, name, code, capacity, shifts);
    factory._departments = new Map(departments.map(d => [d.id.value, d]));
    factory._workCenters = new Map(workCenters.map(wc => [wc.id.value, wc]));
    factory._packets = new Map(packets.map(p => [p.id.value, p]));
    factory._deletedAt = deletedAt;
    return factory;
  }

  get id(): FactoryId { return this._id; }
  get companyId(): string { return this._companyId; }
  get branchId(): string { return this._branchId; }
  get name(): string { return this._name; }
  get code(): string { return this._code; }
  get capacity(): number { return this._capacity; }
  get shifts(): Shift[] { return [...this._shifts]; }
  get departments(): any[] { return Array.from(this._departments.values()); }
  get workCenters(): any[] { return Array.from(this._workCenters.values()); }
  get packets(): any[] { return Array.from(this._packets.values()); }
  get deletedAt(): Date | null { return this._deletedAt; }

  addDepartment(department: any): void {
    this._departments.set(department.id.value, department);
    this.incrementVersion();
  }

  removeDepartment(departmentId: string): void {
    this._departments.delete(departmentId);
    this.incrementVersion();
  }

  addWorkCenter(workCenter: any): void {
    this._workCenters.set(workCenter.id.value, workCenter);
    this.incrementVersion();
  }

  removeWorkCenter(workCenterId: string): void {
    this._workCenters.delete(workCenterId);
    this.incrementVersion();
  }

  addPacket(packet: any): void {
    this._packets.set(packet.id.value, packet);
    this.incrementVersion();
  }

  removePacket(packetId: string): void {
    this._packets.delete(packetId);
    this.incrementVersion();
  }

  updateCapacity(capacity: number): void {
    this._capacity = capacity;
    this.incrementVersion();
  }

  updateShifts(shifts: Shift[]): void {
    this._shifts = shifts;
    this.incrementVersion();
  }

  softDelete(): void {
    this._deletedAt = new Date();
    this.incrementVersion();
  }
}

export interface Shift {
  name: string;
  startTime: string;
  endTime: string;
  days: number[];
}