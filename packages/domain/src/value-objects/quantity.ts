export type UnitOfMeasure =
  | 'PCS'
  | 'KG'
  | 'G'
  | 'CT'
  | 'MM'
  | 'CM'
  | 'ML'
  | 'L'
  | 'MTR'
  | 'SET'
  | 'BOX'
  | 'BAG';

export interface QuantityProps {
  value: number;
  uom: UnitOfMeasure;
  precision?: number;
}

export class Quantity {
  private _value: number;
  private _uom: UnitOfMeasure;
  private _precision: number;

  private constructor(props: QuantityProps) {
    this._value = props.value;
    this._uom = props.uom;
    this._precision = props.precision ?? 4;
  }

  static create(props: QuantityProps): Quantity {
    if (props.value < 0) throw new Error('Quantity cannot be negative');
    return new Quantity(props);
  }

  static zero(uom: UnitOfMeasure = 'PCS'): Quantity {
    return new Quantity({ value: 0, uom });
  }

  get value(): number {
    return this._value;
  }

  get uom(): UnitOfMeasure {
    return this._uom;
  }

  get precision(): number {
    return this._precision;
  }

  add(other: Quantity): Quantity {
    this.assertSameUom(other);
    return new Quantity({
      value: this._value + other._value,
      uom: this._uom,
      precision: this._precision,
    });
  }

  subtract(other: Quantity): Quantity {
    this.assertSameUom(other);
    return new Quantity({
      value: this._value - other._value,
      uom: this._uom,
      precision: this._precision,
    });
  }

  private assertSameUom(other: Quantity): void {
    if (this._uom !== other._uom) {
      throw new Error(`UoM mismatch: ${this._uom} vs ${other._uom}`);
    }
  }

  toJSON(): QuantityProps {
    return {
      value: this._value,
      uom: this._uom,
      precision: this._precision,
    };
  }

  equals(other: Quantity): boolean {
    return this._value === other._value && this._uom === other._uom;
  }

  toString(): string {
    return `${this._value.toFixed(this._precision)} ${this._uom}`;
  }
}