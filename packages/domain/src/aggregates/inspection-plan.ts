import { AggregateRoot } from '../aggregate-root';
import { DomainEvent } from '../aggregate-root';
import { InspectionPlanId, ProductionOrderId } from '../value-objects';
import { QualityInspection } from './quality-inspection';
import { Nonconformance } from './nonconformance';

export class InspectionPlan extends AggregateRoot {
  private _id: string;
  private _companyId: string;
  private _productId: string;
  private _version: number;
  private _status: InspectionPlanStatus;
  private _steps: any[] = [];
  private _deletedAt: Date | null = null;

  private constructor(
    id: string,
    companyId: string,
    productId: string,
    version: number,
    status: InspectionPlanStatus
  ) {
    super();
    this._id = id;
    this._companyId = companyId;
    this._productId = productId;
    this._version = version;
    this._status = status;
  }

  static create(companyId: string, productId: string): InspectionPlan {
    const id = crypto.randomUUID();
    const plan = new InspectionPlan(id, companyId, productId, 1, 'DRAFT');
    plan.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'InspectionPlanCreated',
      version: 1,
      aggregateId: id,
      aggregateType: 'InspectionPlan',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: '',
      organizationScope: { companyId, productId, planId: id },
      payload: { productId },
    });
    return plan;
  }

  static reconstruct(
    id: string,
    companyId: string,
    productId: string,
    version: number,
    status: InspectionPlanStatus,
    steps: any[],
    deletedAt: Date | null
  ): InspectionPlan {
    const plan = new InspectionPlan(id, companyId, productId, version, status);
    plan._steps = steps;
    plan._deletedAt = deletedAt;
    return plan;
  }

  get id(): string { return this._id; }
  get companyId(): string { return this._companyId; }
  get productId(): string { return this._productId; }
  get version(): number { return this._version; }
  get status(): InspectionPlanStatus { return this._status; }
  get steps(): any[] { return [...this._steps]; }
  get deletedAt(): Date | null { return this._deletedAt; }

  addStep(step: any): void {
    if (this._status !== 'DRAFT') {
      throw new Error('Cannot add steps to non-draft plan');
    }
    this._steps.push({ ...step, seq: this._steps.length + 1 });
    this.incrementVersion();
  }

  removeStep(seq: number): void {
    if (this._status !== 'DRAFT') {
      throw new Error('Cannot remove steps from non-draft plan');
    }
    this._steps = this._steps.filter(s => s.seq !== seq);
    this._steps.forEach((s, i) => s.seq = i + 1);
    this.incrementVersion();
  }

  updateStep(seq: number, step: any): void {
    if (this._status !== 'DRAFT') {
      throw new Error('Cannot update steps in non-draft plan');
    }
    const idx = this._steps.findIndex(s => s.seq === seq);
    if (idx === -1) throw new Error(`Step ${seq} not found`);
    this._steps[idx] = { ...this._steps[idx], ...step, seq };
    this.incrementVersion();
  }

  activate(): void {
    if (this._steps.length === 0) {
      throw new Error('Cannot activate plan without steps');
    }
    this._status = 'ACTIVE';
    this.incrementVersion();
  }

  archive(): void {
    this._status = 'ARCHIVED';
    this.incrementVersion();
  }

  softDelete(): void {
    this._deletedAt = new Date();
    this.incrementVersion();
  }
}

export type InspectionPlanStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';