export type WeightUnit = 'carat' | 'gram' | 'milligram' | 'kilogram';

export interface WeightProps {
  value: number;
  unit: WeightUnit;
  precision?: number;
}

export class Weight {
  private _value: number;
  private _unit: WeightUnit;
  private _precision: number;

  private constructor(props: WeightProps) {
    this._value = props.value;
    this._unit = props.unit;
    this._precision = props.precision ?? 4;
  }

  static create(props: WeightProps): Weight {
    if (props.value < 0) throw new Error('Weight value cannot be negative');
    return new Weight(props);
  }

  static zero(unit: WeightUnit = 'carat'): Weight {
    return new Weight({ value: 0, unit });
  }

  get value(): number {
    return this._value;
  }

  get unit(): WeightUnit {
    return this._unit;
  }

  get precision(): number {
    return this._precision;
  }

  toCarat(): number {
    const conversions: Record<WeightUnit, number> = {
      carat: 1,
      gram: 5,
      milligram: 0.005,
      kilogram: 5000,
    };
    return Number((this._value * conversions[this._unit]).toFixed(this._precision));
  }

  toGram(): number {
    return Number((this.toCarat() / 5).toFixed(this._precision));
  }

  convert(targetUnit: WeightUnit): Weight {
    const inCarat = this.toCarat();
    const toTarget: Record<WeightUnit, number> = {
      carat: inCarat,
      gram: inCarat / 5,
      milligram: inCarat / 0.005,
      kilogram: inCarat / 5000,
    };
    return new Weight({ value: Number(toTarget[targetUnit].toFixed(this._precision)), unit: targetUnit, precision: this._precision });
  }

  add(other: Weight): Weight {
    const totalCarat = this.toCarat() + other.toCarat();
    return new Weight({ value: totalCarat, unit: 'carat', precision: this._precision });
  }

  subtract(other: Weight): Weight {
    const totalCarat = this.toCarat() - other.toCarat();
    if (totalCarat < 0) throw new Error('Subtraction would result in negative weight');
    return new Weight({ value: Number(totalCarat.toFixed(this._precision)), unit: 'carat', precision: this._precision });
  }

  lessThan(other: Weight): boolean {
    return this.toCarat() < other.toCarat();
  }

  greaterThan(other: Weight): boolean {
    return this.toCarat() > other.toCarat();
  }

  toJSON(): WeightProps {
    return {
      value: this._value,
      unit: this._unit,
      precision: this._precision,
    };
  }

  equals(other: Weight): boolean {
    return this.toCarat() === other.toCarat();
  }

  toString(): string {
    const symbol: Record<WeightUnit, string> = {
      carat: 'ct',
      gram: 'g',
      milligram: 'mg',
      kilogram: 'kg',
    };
    return `${this._value.toFixed(this._precision)} ${symbol[this._unit]}`;
  }
}