import { ValueObject } from '../value-objects';

export class BomLine extends ValueObject {
  private _bomId: string;
  private _itemId: string;
  private _itemName: string;
  private _qty: number;
  private _uom: string;
  private _operationSeq: number | null;
  private _scrapPct: number;

  private constructor(
    bomId: string,
    itemId: string,
    itemName: string,
    qty: number,
    uom: string,
    operationSeq: number | null,
    scrapPct: number
  ) {
    super();
    this._bomId = bomId;
    this._itemId = itemId;
    this._itemName = itemName;
    this._qty = qty;
    this._uom = uom;
    this._operationSeq = operationSeq;
    this._scrapPct = scrapPct;
  }

  static create(
    bomId: string,
    itemId: string,
    itemName: string,
    qty: number,
    uom: string,
    operationSeq: number | null = null,
    scrapPct: number = 0
  ): BomLine {
    return new BomLine(bomId, itemId, itemName, qty, uom, operationSeq, scrapPct);
  }

  static reconstruct(
    bomId: string,
    itemId: string,
    itemName: string,
    qty: number,
    uom: string,
    operationSeq: number | null,
    scrapPct: number
  ): BomLine {
    return new BomLine(bomId, itemId, itemName, qty, uom, operationSeq, scrapPct);
  }

  get bomId(): string { return this._bomId; }
  get itemId(): string { return this._itemId; }
  get itemName(): string { return this._itemName; }
  get qty(): number { return this._qty; }
  get uom(): string { return this._uom; }
  get operationSeq(): number | null { return this._operationSeq; }
  get scrapPct(): number { return this._scrapPct; }

  updateQty(qty: number): BomLine {
    return new BomLine(this._bomId, this._itemId, this._itemName, qty, this._uom, this._operationSeq, this._scrapPct);
  }

  updateUom(uom: string): BomLine {
    return new BomLine(this._bomId, this._itemId, this._itemName, this._qty, uom, this._operationSeq, this._scrapPct);
  }

  updateOperationSeq(operationSeq: number | null): BomLine {
    return new BomLine(this._bomId, this._itemId, this._itemName, this._qty, this._uom, operationSeq, this._scrapPct);
  }

  updateScrapPct(scrapPct: number): BomLine {
    return new BomLine(this._bomId, this._itemId, this._itemName, this._qty, this._uom, this._operationSeq, scrapPct);
  }

  equals(other: BomLine): boolean {
    return this._bomId === other._bomId && this._itemId === other._itemId;
  }
}