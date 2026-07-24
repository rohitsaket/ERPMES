import { AggregateRoot } from '../aggregate-root';
import { DomainEvent } from '../aggregate-root';
import { CompanyId } from '../value-objects';
import { Branch } from './branch';

export class Company extends AggregateRoot {
  private _id: CompanyId;
  private _name: string;
  private _code: string;
  private _settings: Record<string, unknown>;
  private _branches: Map<string, Branch> = new Map();
  private _deletedAt: Date | null = null;

  private constructor(
    id: CompanyId,
    name: string,
    code: string,
    settings: Record<string, unknown>
  ) {
    super();
    this._id = id;
    this._name = name;
    this._code = code;
    this._settings = settings;
  }

  static create(name: string, code: string, settings: Record<string, unknown> = {}): Company {
    const id = CompanyId.generate();
    const company = new Company(id, name, code, settings);
    company.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'CompanyCreated',
      version: 1,
      aggregateId: id.value,
      aggregateType: 'Company',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: '',
      organizationScope: { companyId: id.value },
      payload: { name, code, settings },
    });
    return company;
  }

  static reconstruct(
    id: CompanyId,
    name: string,
    code: string,
    settings: Record<string, unknown>,
    branches: Branch[],
    deletedAt: Date | null
  ): Company {
    const company = new Company(id, name, code, settings);
    company._branches = new Map(branches.map(b => [b.id.value, b]));
    company._deletedAt = deletedAt;
    return company;
  }

  get id(): CompanyId { return this._id; }
  get name(): string { return this._name; }
  get code(): string { return this._code; }
  get settings(): Record<string, unknown> { return { ...this._settings }; }
  get branches(): Branch[] { return Array.from(this._branches.values()); }
  get deletedAt(): Date | null { return this._deletedAt; }

  addBranch(branch: Branch): void {
    this._branches.set(branch.id.value, branch);
    this.incrementVersion();
  }

  removeBranch(branchId: string): void {
    this._branches.delete(branchId);
    this.incrementVersion();
  }

  updateSettings(settings: Record<string, unknown>): void {
    this._settings = { ...this._settings, ...settings };
    this.incrementVersion();
  }

  softDelete(): void {
    this._deletedAt = new Date();
    this.incrementVersion();
  }

  restore(): void {
    this._deletedAt = null;
    this.incrementVersion();
  }
}