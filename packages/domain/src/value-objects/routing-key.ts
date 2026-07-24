import type { PriorityLevel } from './priority';
import type { DiamondShape } from './diamond-spec';

export interface RoutingKeyProps {
  companyId: string;
  factoryId: string;
  productId: string;
  diamondType: string;
  shape: DiamondShape;
  customerId: string;
  orderType: string;
  method: string;
  priority: PriorityLevel;
  qualityReq: string;
}

export class RoutingKey {
  private _companyId: string;
  private _factoryId: string;
  private _productId: string;
  private _diamondType: string;
  private _shape: DiamondShape;
  private _customerId: string;
  private _orderType: string;
  private _method: string;
  private _priority: PriorityLevel;
  private _qualityReq: string;

  private constructor(props: RoutingKeyProps) {
    this._companyId = props.companyId;
    this._factoryId = props.factoryId;
    this._productId = props.productId;
    this._diamondType = props.diamondType;
    this._shape = props.shape;
    this._customerId = props.customerId;
    this._orderType = props.orderType;
    this._method = props.method;
    this._priority = props.priority;
    this._qualityReq = props.qualityReq;
  }

  static create(props: RoutingKeyProps): RoutingKey {
    if (!props.companyId) throw new Error('companyId is required');
    if (!props.factoryId) throw new Error('factoryId is required');
    if (!props.productId) throw new Error('productId is required');
    if (!props.diamondType) throw new Error('diamondType is required');
    if (!props.customerId) throw new Error('customerId is required');
    if (!props.orderType) throw new Error('orderType is required');
    if (!props.method) throw new Error('method is required');
    if (!props.qualityReq) throw new Error('qualityReq is required');
    return new RoutingKey(props);
  }

  static zero(): RoutingKey {
    return new RoutingKey({
      companyId: 'default',
      factoryId: 'default',
      productId: 'default',
      diamondType: 'default',
      shape: 'round',
      customerId: 'default',
      orderType: 'default',
      method: 'default',
      priority: 'normal',
      qualityReq: 'default',
    });
  }

  get companyId(): string { return this._companyId; }
  get factoryId(): string { return this._factoryId; }
  get productId(): string { return this._productId; }
  get diamondType(): string { return this._diamondType; }
  get shape(): DiamondShape { return this._shape; }
  get customerId(): string { return this._customerId; }
  get orderType(): string { return this._orderType; }
  get method(): string { return this._method; }
  get priority(): PriorityLevel { return this._priority; }
  get qualityReq(): string { return this._qualityReq; }

  get compositeKey(): string {
    return [
      this._companyId,
      this._factoryId,
      this._productId,
      this._diamondType,
      this._shape,
      this._customerId,
      this._orderType,
      this._method,
      this._priority,
      this._qualityReq,
    ].join('::');
  }

  withOverrides(overrides: Partial<RoutingKeyProps>): RoutingKey {
    return new RoutingKey({
      companyId: overrides.companyId ?? this._companyId,
      factoryId: overrides.factoryId ?? this._factoryId,
      productId: overrides.productId ?? this._productId,
      diamondType: overrides.diamondType ?? this._diamondType,
      shape: overrides.shape ?? this._shape,
      customerId: overrides.customerId ?? this._customerId,
      orderType: overrides.orderType ?? this._orderType,
      method: overrides.method ?? this._method,
      priority: overrides.priority ?? this._priority,
      qualityReq: overrides.qualityReq ?? this._qualityReq,
    });
  }

  toJSON(): RoutingKeyProps {
    return {
      companyId: this._companyId,
      factoryId: this._factoryId,
      productId: this._productId,
      diamondType: this._diamondType,
      shape: this._shape,
      customerId: this._customerId,
      orderType: this._orderType,
      method: this._method,
      priority: this._priority,
      qualityReq: this._qualityReq,
    };
  }

  equals(other: RoutingKey): boolean {
    return this.compositeKey === other.compositeKey;
  }

  toString(): string {
    return this.compositeKey;
  }
}