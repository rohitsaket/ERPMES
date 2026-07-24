import { AggregateRoot } from '../aggregate-root';
import { DomainEvent } from '../aggregate-root';
import { BranchId } from '../value-objects';
import { Factory } from './factory';

export class Branch extends AggregateRoot {
  private _id: BranchId;
  private _companyId: string;
  private _name: string;
  private _code: string;
  private _address: Address | null;
  private _timezone: string;
  private _factories: Map<string, Factory> = new Map();
  private _deletedAt: Date | null = null;

  private constructor(
    id: BranchId,
    companyId: string,
    name: string,
    code: string,
    address: Address | null,
    timezone: string
  ) {
    super();
    this._id = id;
    this._companyId = companyId;
    this._name = name;
    this._code = code;
    this._address = address;
    this._timezone = timezone;
  }

  static create(
    companyId: string,
    name: string,
    code: string,
    address: Address | null,
    timezone: string = 'UTC'
  ): Branch {
    const id = BranchId.generate();
    const branch = new Branch(id, companyId, name, code, address, timezone);
    branch.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'BranchCreated',
      version: 1,
      aggregateId: id.value,
      aggregateType: 'Branch',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: '',
      organizationScope: { companyId, branchId: id.value },
      payload: { name, code, address, timezone },
    });
    return branch;
  }

  static reconstruct(
    id: BranchId,
    companyId: string,
    name: string,
    code: string,
    address: Address | null,
    timezone: string,
    factories: Factory[],
    deletedAt: Date | null
  ): Branch {
    const branch = new Branch(id, companyId, name, code, address, timezone);
    branch._factories = new Map(factories.map(f => [f.id.value, f]));
    branch._deletedAt = deletedAt;
    return branch;
  }

  get id(): BranchId { return this._id; }
  get companyId(): string { return this._companyId; }
  get name(): string { return this._name; }
  get code(): string { return this._code; }
  get address(): Address | null { return this._address; }
  get timezone(): string { return this._timezone; }
  get factories(): Factory[] { return Array.from(this._factories.values()); }
  get deletedAt(): Date | null { return this._deletedAt; }

  addFactory(factory: Factory): void {
    this._factories.set(factory.id.value, factory);
    this.incrementVersion();
  }

  removeFactory(factoryId: string): void {
    this._factories.delete(factoryId);
    this.incrementVersion();
  }

  updateAddress(address: Address): void {
    this._address = address;
    this.incrementVersion();
  }

  updateTimezone(timezone: string): void {
    this._timezone = timezone;
    this.incrementVersion();
  }

  softDelete(): void {
    this._deletedAt = new Date();
    this.incrementVersion();
  }
}

export interface Address {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}