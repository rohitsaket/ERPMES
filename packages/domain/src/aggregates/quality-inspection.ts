import { AggregateRoot } from '../aggregate-root';
import { DomainEvent } from '../aggregate-root';
import { InspectionPlanId, ProductionOrderId } from '../value-objects';
import { Nonconformance } from './nonconformance';

export class QualityInspection extends AggregateRoot {
  private _id: string;
  private _productionOrderId: ProductionOrderId;
  private _stepId: string;
  private _operationId: string | null;
  private _status: InspectionStatus;
  private _value: number | null;
  private _result: InspectionResult | null;
  private _inspectorId: string;
  private _timestamp: Date;
  private _ncrId: string | null;
  private _images: string[] = [];
  private _deletedAt: Date | null = null;

  private constructor(
    id: string,
    productionOrderId: ProductionOrderId,
    stepId: string,
    operationId: string | null,
    status: InspectionStatus,
    inspectorId: string,
    timestamp: Date
  ) {
    super();
    this._id = id;
    this._productionOrderId = productionOrderId;
    this._stepId = stepId;
    this._operationId = operationId;
    this._status = status;
    this._inspectorId = inspectorId;
    this._timestamp = timestamp;
  }

  static create(
    productionOrderId: ProductionOrderId,
    stepId: string,
    operationId: string | null,
    inspectorId: string
  ): QualityInspection {
    const id = crypto.randomUUID();
    const inspection = new QualityInspection(id, productionOrderId, stepId, operationId, 'PENDING', inspectorId, new Date());
    inspection.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'QualityInspectionCreated',
      version: 1,
      aggregateId: id,
      aggregateType: 'QualityInspection',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: inspectorId,
      organizationScope: { productionOrderId: productionOrderId.value, inspectionId: id },
      payload: { stepId, operationId: operationId?.value },
    });
    return inspection;
  }

  static reconstruct(
    id: string,
    productionOrderId: ProductionOrderId,
    stepId: string,
    operationId: string | null,
    status: InspectionStatus,
    value: number | null,
    result: InspectionResult | null,
    inspectorId: string,
    timestamp: Date,
    ncrId: string | null,
    images: string[],
    deletedAt: Date | null
  ): QualityInspection {
    const inspection = new QualityInspection(id, productionOrderId, stepId, operationId, status, inspectorId, timestamp);
    inspection._value = value;
    inspection._result = result;
    inspection._ncrId = ncrId;
    inspection._images = images;
    inspection._deletedAt = deletedAt;
    return inspection;
  }

  get id(): string { return this._id; }
  get productionOrderId(): ProductionOrderId { return this._productionOrderId; }
  get stepId(): string { return this._stepId; }
  get operationId(): string | null { return this._operationId; }
  get status(): InspectionStatus { return this._status; }
  get value(): number | null { return this._value; }
  get result(): InspectionResult | null { return this._result; }
  get inspectorId(): string { return this._inspectorId; }
  get timestamp(): Date { return this._timestamp; }
  get ncrId(): string | null { return this._ncrId; }
  get images(): string[] { return [...this._images]; }
  get deletedAt(): Date | null { return this._deletedAt; }

  complete(value: number, result: InspectionResult, images: string[] = []): void {
    if (this._status !== 'PENDING' && this._status !== 'IN_PROGRESS') {
      throw new Error('Inspection must be PENDING or IN_PROGRESS to complete');
    }
    this._value = value;
    this._result = result;
    this._images = images;
    this._status = result === 'PASS' ? 'PASSED' : 'FAILED';
    this._timestamp = new Date();
    this.incrementVersion();
    
    if (result === 'FAIL') {
      this._ncrId = crypto.randomUUID();
      this.addEvent({
        eventId: crypto.randomUUID(),
        eventType: 'QualityInspectionFailed',
        version: 1,
        aggregateId: this._id,
        aggregateType: 'QualityInspection',
        timestamp: new Date(),
        correlationId: crypto.randomUUID(),
        causationId: undefined,
        userId: '',
        organizationScope: { productionOrderId: this._productionOrderId.value, inspectionId: this._id },
        payload: { value, stepId: this._stepId },
      });
    }
  }

  createNCR(ncrId: string): void {
    this._ncrId = ncrId;
    this.incrementVersion();
  }

  startInspection(): void {
    if (this._status !== 'PENDING') {
      throw new Error('Inspection must be PENDING to start');
    }
    this._status = 'IN_PROGRESS';
    this.incrementVersion();
  }

  addImage(imageUrl: string): void {
    this._images.push(imageUrl);
    this.incrementVersion();
  }

  softDelete(): void {
    this._deletedAt = new Date();
    this.incrementVersion();
  }
}

export type InspectionStatus = 'PENDING' | 'IN_PROGRESS' | 'PASSED' | 'FAILED';
export type InspectionResult = 'PASS' | 'FAIL';