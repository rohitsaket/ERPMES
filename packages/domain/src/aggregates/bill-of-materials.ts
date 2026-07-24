import { AggregateRoot } from '../aggregate-root';
import { DomainEvent } from '../aggregate-root';
import { BomId } from '../value-objects';
import { BomLine } from './bom-line';

export class BillOfMaterials extends AggregateRoot {
  private _id: BomId;
  private _productId: string;
  private _version: number;
  private _lines: Map<string, BomLine> = new Map();
  private _deletedAt: Date | null = null;

  private constructor(
    id: BomId,
    productId: string,
    version: number
  ) {
    super();
    this._id = id;
    this._productId = productId;
    this._version = version;
  }

  static create(productId: string): BillOfMaterials {
    const id = BomId.generate();
    const bom = new BillOfMaterials(id, productId, 1);
    bom.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'BomCreated',
      version: 1,
      aggregateId: id.value,
      aggregateType: 'BillOfMaterials',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: '',
      organizationScope: { productId, bomId: id.value },
      payload: { productId },
    });
    return bom;
  }

  static reconstruct(
    id: BomId,
    productId: string,
    version: number,
    lines: BomLine[],
    deletedAt: Date | null
  ): BillOfMaterials {
    const bom = new BillOfMaterials(id, productId, version);
    bom._lines = new Map(lines.map(line => [line.itemId, line]));
    bom._deletedAt = deletedAt;
    return bom;
  }

  get id(): BomId { return this._id; }
  get productId(): string { return this._productId; }
  get version(): number { return this._version; }
  get lines(): BomLine[] { return Array.from(this._lines.values()); }
  get deletedAt(): Date | null { return this._deletedAt; }

  addLine(line: BomLine): void {
    if (this._lines.has(line.itemId)) {
      throw new Error(`BOM line for item ${line.itemId} already exists`);
    }
    this._lines.set(line.itemId, line);
    this.incrementVersion();
  }

  removeLine(itemId: string): void {
    this._lines.delete(itemId);
    this.incrementVersion();
  }

  updateLine(line: BomLine): void {
    if (!this._lines.has(line.itemId)) {
      throw new Error(`BOM line for item ${line.itemId} not found`);
    }
    this._lines.set(line.itemId, line);
    this.incrementVersion();
  }

  createNewVersion(): BillOfMaterials {
    const newBom = BillOfMaterials.create(this._productId);
    for (const line of this._lines.values()) {
      newBom.addLine(line);
    }
    newBom._version = this._version + 1;
    return newBom;
  }

  softDelete(): void {
    this._deletedAt = new Date();
    this.incrementVersion();
  }
}