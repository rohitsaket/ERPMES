import { AggregateRoot } from '../aggregate-root';
import { DomainEvent } from '../aggregate-root';
import { DiamondId, CertificateId, DiamondPacketId, BagId } from '../value-objects/ids';

export class Diamond extends AggregateRoot {
  private _id: DiamondId;
  private _companyId: string;
  private _certificateNo: string;
  private _carat: number;
  private _color: string;
  private _clarity: string;
  private _cut: string;
  private _shape: string;
  private _origin: string | null;
  private _status: DiamondStatus;
  private _currentOwnerId: string | null;
  private _currentPacketId: string | null;
  private _currentDeptId: string | null;
  private _currentEmployeeId: string | null;
  private _currentBagId: string | null;
  private _events: Map<string, any> = new Map();
  private _deletedAt: Date | null = null;

  private constructor(
    id: DiamondId,
    companyId: string,
    certificateNo: string,
    carat: number,
    color: string,
    clarity: string,
    cut: string,
    shape: string,
    origin: string | null
  ) {
    super();
    this._id = id;
    this._companyId = companyId;
    this._certificateNo = certificateNo;
    this._carat = carat;
    this._color = color;
    this._clarity = clarity;
    this._cut = cut;
    this._shape = shape;
    this._origin = origin;
    this._status = 'ROUGH';
  }

  static create(
    companyId: string,
    certificateNo: string,
    carat: number,
    color: string,
    clarity: string,
    cut: string,
    shape: string,
    origin: string | null = null
  ): Diamond {
    const id = DiamondId.generate();
    const diamond = new Diamond(id, companyId, certificateNo, carat, color, clarity, cut, shape, origin);
    diamond.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'DiamondCreated',
      version: 1,
      aggregateId: id.value,
      aggregateType: 'Diamond',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: '',
      organizationScope: { companyId, diamondId: id.value },
      payload: { certificateNo, carat, color, clarity, cut, shape, origin },
    });
    return diamond;
  }

  static reconstruct(
    id: DiamondId,
    companyId: string,
    certificateNo: string,
    carat: number,
    color: string,
    clarity: string,
    cut: string,
    shape: string,
    origin: string | null,
    status: DiamondStatus,
    currentOwnerId: string | null,
    currentPacketId: string | null,
    currentDeptId: string | null,
    currentEmployeeId: string | null,
    currentBagId: string | null,
    events: Map<string, any>,
    deletedAt: Date | null
  ): Diamond {
    const diamond = new Diamond(id, companyId, certificateNo, carat, color, clarity, cut, shape, origin);
    diamond._status = status;
    diamond._currentOwnerId = currentOwnerId;
    diamond._currentPacketId = currentPacketId;
    diamond._currentDeptId = currentDeptId;
    diamond._currentEmployeeId = currentEmployeeId;
    diamond._currentBagId = currentBagId;
    diamond._events = events;
    diamond._deletedAt = deletedAt;
    return diamond;
  }

  get id(): DiamondId { return this._id; }
  get companyId(): string { return this._companyId; }
  get certificateNo(): string { return this._certificateNo; }
  get carat(): number { return this._carat; }
  get color(): string { return this._color; }
  get clarity(): string { return this._clarity; }
  get cut(): string { return this._cut; }
  get shape(): string { return this._shape; }
  get origin(): string | null { return this._origin; }
  get status(): DiamondStatus { return this._status; }
  get currentOwnerId(): string | null { return this._currentOwnerId; }
  get currentPacketId(): string | null { return this._currentPacketId; }
  get currentDeptId(): string | null { return this._currentDeptId; }
  get currentEmployeeId(): string | null { return this._currentEmployeeId; }
  get currentBagId(): string | null { return this._currentBagId; }
  get events(): Map<string, any> { return new Map(this._events); }
  get deletedAt(): Date | null { return this._deletedAt; }

  allocate(ownerId: string, packetId: string, deptId: string, employeeId: string): void {
    this._currentOwnerId = ownerId;
    this._currentPacketId = packetId;
    this._currentDeptId = deptId;
    this._currentEmployeeId = employeeId;
    this._status = 'IN_PROCESS';
    this.incrementVersion();

    this.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'DiamondAllocated',
      version: this.version,
      aggregateId: this._id.value,
      aggregateType: 'Diamond',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: '',
      organizationScope: { companyId: this._companyId, diamondId: this._id.value },
      payload: { ownerId, packetId, deptId, employeeId },
    });
  }

  transfer(fromDeptId: string, toDeptId: string, packetId: string, employeeId: string, weightBefore: number, weightAfter: number): void {
    const lossPct = weightBefore > 0 ? ((weightBefore - weightAfter) / weightBefore) * 100 : 0;
    
    this._currentDeptId = toDeptId;
    this._currentEmployeeId = employeeId;
    this._currentPacketId = fromDeptId === toDeptId ? this._currentPacketId : packetId;
    this.incrementVersion();

    this.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'DiamondTransferred',
      version: this.version,
      aggregateId: this._id.value,
      aggregateType: 'Diamond',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: '',
      organizationScope: { companyId: this._companyId, diamondId: this._id.value },
      payload: {
        fromDeptId,
        toDeptId,
        packetId,
        employeeId,
        weightBefore,
        weightAfter,
        lossPct: Math.round(weightAfter * 100) / 100,
      },
    });
  }

  split(parentId: string, newCarat: number): Diamond {
    const newId = DiamondId.generate();
    const newDiamond = new Diamond(newId, this._companyId, '', newCarat, this._color, this._clarity, this._cut, this._shape, this._origin);
    newDiamond._status = 'IN_PROCESS';
    newDiamond._currentOwnerId = this._currentOwnerId;
    newDiamond._currentPacketId = this._currentPacketId;
    newDiamond._currentDeptId = this._currentDeptId;
    newDiamond._currentEmployeeId = this._currentEmployeeId;
    newDiamond._currentBagId = this._currentBagId;
    
    this._carat -= newCarat;
    this.incrementVersion();

    this.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'DiamondSplit',
      version: this.version,
      aggregateId: this._id.value,
      aggregateType: 'Diamond',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: '',
      organizationScope: { companyId: this._companyId, diamondId: this._id.value },
      payload: { parentId: this._id.value, newDiamondId: newDiamond.id.value, originalCarat: this._carat + newCarat, newCarat },
    });

    newDiamond.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'DiamondCreated',
      version: 1,
      aggregateId: newDiamond._id.value,
      aggregateType: 'Diamond',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: '',
      organizationScope: { companyId: this._companyId, diamondId: newDiamond._id.value },
      payload: { fromSplit: true, parentDiamondId: this._id.value, carat: newCarat },
    });

    return newDiamond;
  }

  merge(otherDiamond: Diamond): void {
    this._carat += otherDiamond._carat;
    this.incrementVersion();

    this.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'DiamondMerged',
      version: this.version,
      aggregateId: this._id.value,
      aggregateType: 'Diamond',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: '',
      organizationScope: { companyId: this._companyId, diamondId: this._id.value },
      payload: { mergedDiamondId: otherDiamond._id.value, resultingCarat: this._carat },
    });
  }

  certify(certificateId: string, labId: string): void {
    this._status = 'CERTIFIED';
    this.incrementVersion();
  }

  bag(bagId: string): void {
    this._status = 'BAGGED';
    this._currentBagId = bagId;
    this.incrementVersion();
  }

  dispatch(): void {
    this._status = 'DISPATCHED';
    this.incrementVersion();
  }

  receive(customerId: string): void {
    this._status = 'SOLD';
    this._currentOwnerId = customerId;
    this.incrementVersion();
  }

  returnDiamond(): void {
    this._status = 'RETURNED';
    this.incrementVersion();
  }

  repair(): void {
    this._status = 'REPAIR';
    this.incrementVersion();
  }

  softDelete(): void {
    this._deletedAt = new Date();
    this.incrementVersion();
  }

  get genealogy(): any[] {
    return Array.from(this._events.values()).sort((a: any, b: any) => a.timestamp.getTime() - b.timestamp.getTime());
  }
}

export type DiamondStatus = 'ROUGH' | 'IN_PROCESS' | 'POLISHED' | 'CERTIFIED' | 'BAGGED' | 'DISPATCHED' | 'SOLD' | 'RETURNED' | 'REPAIR';