import { AggregateRoot } from '../aggregate-root';
import { DomainEvent } from '../aggregate-root';
import { InspectionId } from '../value-objects';

export class Nonconformance extends AggregateRoot {
  private _id: string;
  private _inspectionId: InspectionId;
  private _type: NcrType;
  private _severity: NcrSeverity;
  private _disposition: NcrDisposition | null;
  private _rootCause: string | null;
  private _correctiveAction: string | null;
  private _status: NcrStatus;
  private _dispositionedAt: Date | null;
  private _dispositionedBy: string | null;
  private _capa: any | null;
  private _reinspections: any[] = [];
  private _deletedAt: Date | null = null;

  private constructor(
    id: string,
    inspectionId: InspectionId,
    type: NcrType,
    severity: NcrSeverity
  ) {
    super();
    this._id = id;
    this._inspectionId = inspectionId;
    this._type = type;
    this._severity = severity;
    this._status = 'OPEN';
  }

  static create(inspectionId: InspectionId, type: NcrType, severity: NcrSeverity): Nonconformance {
    const id = crypto.randomUUID();
    const ncr = new Nonconformance(id, inspectionId, type, severity);
    ncr.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'NonconformanceCreated',
      version: 1,
      aggregateId: id,
      aggregateType: 'Nonconformance',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: '',
      organizationScope: { inspectionId: inspectionId.value, ncrId: id },
      payload: { type, severity },
    });
    return ncr;
  }

  static reconstruct(
    id: string,
    inspectionId: InspectionId,
    type: NcrType,
    severity: NcrSeverity,
    disposition: string | null,
    rootCause: string | null,
    correctiveAction: string | null,
    status: NcrStatus,
    dispositionedAt: Date | null,
    dispositionedBy: string | null,
    capa: any | null,
    reinspections: any[],
    deletedAt: Date | null
  ): Nonconformance {
    const ncr = new Nonconformance(id, inspectionId, null as any, null as any);
    ncr._type = type;
    ncr._severity = severity;
    ncr._disposition = disposition;
    ncr._rootCause = rootCause;
    ncr._correctiveAction = correctiveAction;
    ncr._status = status;
    ncr._dispositionedAt = dispositionedAt;
    ncr._dispositionedBy = dispositionedBy;
    ncr._capa = capa;
    ncr._reinspections = reinspections;
    ncr._deletedAt = deletedAt;
    return ncr;
  }

  get id(): string { return this._id; }
  get inspectionId(): InspectionId { return this._inspectionId; }
  get type(): NcrType { return this._type; }
  get severity(): NcrSeverity { return this._severity; }
  get disposition(): string | null { return this._disposition; }
  get rootCause(): string | null { return this._rootCause; }
  get correctiveAction(): string | null { return this._correctiveAction; }
  get status(): NcrStatus { return this._status; }
  get dispositionedAt(): Date | null { return this._dispositionedAt; }
  get dispositionedBy(): string | null { return this._dispositionedBy; }
  get capa(): any | null { return this._capa; }
  get reinspections(): any[] { return [...this._reinspections]; }
  get deletedAt(): Date | null { return this._deletedAt; }

  disposition(disposition: NcrDisposition, rootCause: string, correctiveAction: string, dispositionedBy: string): void {
    if (this._status !== 'OPEN') {
      throw new Error('NCR must be OPEN to disposition');
    }
    this._disposition = disposition;
    this._rootCause = rootCause;
    this._correctiveAction = correctiveAction;
    this._status = 'DISPOSITIONED';
    this._dispositionedAt = new Date();
    this._dispositionedBy = dispositionedBy;
    this.incrementVersion();

    this.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'NonconformanceDispositioned',
      version: this.version,
      aggregateId: this._id,
      aggregateType: 'Nonconformance',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: dispositionedBy,
      organizationScope: { inspectionId: this._inspectionId.value, ncrId: this._id },
      payload: { disposition, rootCause, correctiveAction },
    });
  }

  createCAPA(capaId: string, description: string, ownerId: string, dueDate: Date): void {
    this._capa = {
      id: capaId,
      description,
      ownerId,
      dueDate,
      completedAt: null,
      verifiedAt: null,
      verifiedBy: null,
      effectiveness: null,
    };
    this.incrementVersion();

    this.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'CapaCreated',
      version: 1,
      aggregateId: this._id,
      aggregateType: 'Nonconformance',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: '',
      organizationScope: { ncrId: this._id },
      payload: { capaId, description, ownerId, dueDate },
    });
  }

  completeCAPA(completedBy: string): void {
    if (!this._capa) throw new Error('No CAPA to complete');
    this._capa.completedAt = new Date();
    this._capa.verifiedBy = completedBy;
    this.incrementVersion();
  }

  verifyCAPA(verifiedBy: string, effectiveness: string): void {
    if (!this._capa) throw new Error('No CAPA to verify');
    this._capa.verifiedAt = new Date();
    this._capa.verifiedBy = verifiedBy;
    this._capa.effectiveness = effectiveness;
    this.incrementVersion();
  }

  addReinspection(reinspectionId: string, inspectionId: string, result: string, inspectedBy: string): void {
    this._reinspections.push({
      id: reinspectionId,
      inspectionId,
      result,
      inspectedAt: new Date(),
      inspectedBy,
    });
    this.incrementVersion();
  }

  close(): void {
    this._status = 'CLOSED';
    this.incrementVersion();
  }

  softDelete(): void {
    this._deletedAt = new Date();
    this.incrementVersion();
  }
}

export type NcrType = 'DIMENSIONAL' | 'VISUAL' | 'WEIGHT' | 'CERTIFICATE' | 'PROCESS';
export type NcrSeverity = 'MINOR' | 'MAJOR' | 'CRITICAL';
export type NcrDisposition = 'REWORK' | 'REPAIR' | 'REGRADE' | 'ACCEPT_DEVIATION' | 'RETURN_TO_SUPPLIER' | 'REJECT';
export type NcrStatus = 'OPEN' | 'DISPOSITIONED' | 'IN_PROGRESS' | 'VERIFIED' | 'CLOSED';