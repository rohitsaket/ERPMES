import { DomainEvent } from '../aggregate-root';
import { RoutingConfigId } from '../value-objects';

export class RoutingConfig {
  private _id: RoutingConfigId;
  private _routingId: string;
  private _companyId: string | null;
  private _factoryId: string | null;
  private _productId: string | null;
  private _diamondType: string | null;
  private _shape: string | null;
  private _customerId: string | null;
  private _orderType: string | null;
  private _method: string | null;
  private _priority: string | null;
  private _qualityReq: string | null;
  private _departmentSequence: string[];
  private _createdAt: Date;
  private _updatedAt: Date;

  private constructor(
    id: RoutingConfigId,
    routingId: string,
    companyId: string | null,
    factoryId: string | null,
    productId: string | null,
    diamondType: string | null,
    shape: string | null,
    customerId: string | null,
    orderType: string | null,
    method: string | null,
    priority: string | null,
    qualityReq: string | null,
    departmentSequence: string[]
  ) {
    this._id = id;
    this._routingId = routingId;
    this._companyId = companyId;
    this._factoryId = factoryId;
    this._productId = productId;
    this._diamondType = diamondType;
    this._shape = shape;
    this._customerId = customerId;
    this._orderType = orderType;
    this._method = method;
    this._priority = priority;
    this._qualityReq = qualityReq;
    this._departmentSequence = departmentSequence;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  static create(
    routingId: string,
    companyId: string | null,
    factoryId: string | null,
    productId: string | null,
    diamondType: string | null,
    shape: string | null,
    customerId: string | null,
    orderType: string | null,
    method: string | null,
    priority: string | null,
    qualityReq: string | null,
    departmentSequence: string[]
  ): RoutingConfig {
    return new RoutingConfig(
      RoutingConfigId.generate(),
      routingId,
      companyId,
      factoryId,
      productId,
      diamondType,
      shape,
      customerId,
      orderType,
      method,
      priority,
      qualityReq,
      departmentSequence
    );
  }

  static reconstruct(
    id: RoutingConfigId,
    routingId: string,
    companyId: string | null,
    factoryId: string | null,
    productId: string | null,
    diamondType: string | null,
    shape: string | null,
    customerId: string | null,
    orderType: string | null,
    method: string | null,
    priority: string | null,
    qualityReq: string | null,
    departmentSequence: string[],
    createdAt: Date,
    updatedAt: Date
  ): RoutingConfig {
    const config = new RoutingConfig(
      id, routingId, companyId, factoryId, productId,
      diamondType, shape, customerId, orderType, method, priority, qualityReq,
      departmentSequence
    );
    config._createdAt = createdAt;
    config._updatedAt = updatedAt;
    return config;
  }

  get id(): any { return this._id; }
  get routingId(): string { return this._routingId; }
  get companyId(): string | null { return this._companyId; }
  get factoryId(): string | null { return this._factoryId; }
  get productId(): string | null { return this._productId; }
  get diamondType(): string | null { return this._diamondType; }
  get shape(): string | null { return this._shape; }
  get customerId(): string | null { return this._customerId; }
  get orderType(): string | null { return this._orderType; }
  get method(): string | null { return this._method; }
  get priority(): string | null { return this._priority; }
  get qualityReq(): string | null { return this._qualityReq; }
  get departmentSequence(): string[] { return [...this._departmentSequence]; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  updateDepartmentSequence(sequence: string[]): void {
    this._departmentSequence = sequence;
    this._updatedAt = new Date();
  }

  updateFilters(
    companyId: string | null,
    factoryId: string | null,
    productId: string | null,
    diamondType: string | null,
    shape: string | null,
    customerId: string | null,
    orderType: string | null,
    method: string | null,
    priority: string | null,
    qualityReq: string | null
  ): void {
    this._companyId = companyId;
    this._factoryId = factoryId;
    this._productId = productId;
    this._diamondType = diamondType;
    this._shape = shape;
    this._customerId = customerId;
    this._orderType = orderType;
    this._method = method;
    this._priority = priority;
    this._qualityReq = qualityReq;
    this._updatedAt = new Date();
  }

  matches(
    companyId: string | null,
    factoryId: string | null,
    productId: string | null,
    diamondType: string | null,
    shape: string | null,
    customerId: string | null,
    orderType: string | null,
    method: string | null,
    priority: string | null,
    qualityReq: string | null
  ): boolean {
    return (
      (!this._companyId || this._companyId === companyId) &&
      (!this._factoryId || this._factoryId === factoryId) &&
      (!this._productId || this._productId === productId) &&
      (!this._diamondType || this._diamondType === diamondType) &&
      (!this._shape || this._shape === shape) &&
      (!this._customerId || this._customerId === customerId) &&
      (!this._orderType || this._orderType === orderType) &&
      (!this._method || this._method === method) &&
      (!this._priority || this._priority === priority) &&
      (!this._qualityReq || this._qualityReq === qualityReq)
    );
  }
}