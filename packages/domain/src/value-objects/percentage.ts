export interface PercentageProps {
  value: number;
  precision?: number;
}

export class Percentage {
  private _value: number;
  private _precision: number;

  private constructor(props: PercentageProps) {
    this._value = props.value;
    this._precision = props.precision ?? 2;
  }

  static create(props: PercentageProps): Percentage {
    if (props.value < 0 || props.value > 100) throw new Error('Percentage must be between 0 and 100');
    return new Percentage({ value: Number(props.value.toFixed(props.precision ?? 2)), precision: props.precision });
  }

  static zero(): Percentage {
    return new Percentage({ value: 0 });
  }

  static oneHundred(): Percentage {
    return new Percentage({ value: 100 });
  }

  get value(): number {
    return this._value;
  }

  get precision(): number {
    return this._precision;
  }

  get asDecimal(): number {
    return Number((this._value / 100).toFixed(this._precision + 2));
  }

  add(other: Percentage): Percentage {
    return new Percentage({ value: Number((this._value + other._value).toFixed(this._precision)), precision: this._precision });
  }

  subtract(other: Percentage): Percentage {
    const result = Number((this._value - other._value).toFixed(this._precision));
    if (result < 0) throw new Error('Subtraction would result in negative percentage');
    return new Percentage({ value: result, precision: this._precision });
  }

  multiply(factor: number): Percentage {
    const result = Number((this._value * factor).toFixed(this._precision));
    if (result > 100) throw new Error('Multiplication would exceed maximum percentage');
    return new Percentage({ value: result, precision: this._precision });
  }

  toJSON(): PercentageProps {
    return {
      value: this._value,
      precision: this._precision,
    };
  }

  equals(other: Percentage): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return `${this._value.toFixed(this._precision)}%`;
  }
}