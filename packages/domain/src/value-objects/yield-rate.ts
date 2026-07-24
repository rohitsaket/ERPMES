export interface YieldRateProps {
  inputWeight: number;
  outputWeight: number;
  unit?: string;
}

export class YieldRate {
  private _inputWeight: number;
  private _outputWeight: number;
  private _value: number;
  private _unit: string;

  private constructor(props: YieldRateProps) {
    this._inputWeight = props.inputWeight;
    this._outputWeight = props.outputWeight;
    this._unit = props.unit ?? 'carat';
    this._value = Number(((props.outputWeight / props.inputWeight) * 100).toFixed(2));
  }

  static create(props: YieldRateProps): YieldRate {
    if (props.inputWeight <= 0) throw new Error('Input weight must be greater than 0');
    if (props.outputWeight < 0) throw new Error('Output weight cannot be negative');
    if (props.outputWeight > props.inputWeight) throw new Error('Output weight cannot exceed input weight');
    return new YieldRate(props);
  }

  static zero(): YieldRate {
    return new YieldRate({ inputWeight: 1, outputWeight: 0 });
  }

  static perfect(inputWeight: number, unit?: string): YieldRate {
    return new YieldRate({ inputWeight, outputWeight: inputWeight, unit });
  }

  get inputWeight(): number {
    return this._inputWeight;
  }

  get outputWeight(): number {
    return this._outputWeight;
  }

  get value(): number {
    return this._value;
  }

  get unit(): string {
    return this._unit;
  }

  get wasteWeight(): number {
    return this._inputWeight - this._outputWeight;
  }

  get wastePercentage(): number {
    return Number((100 - this._value).toFixed(2));
  }

  combine(other: YieldRate): YieldRate {
    const totalInput = this._inputWeight + other._inputWeight;
    const totalOutput = this._outputWeight + other._outputWeight;
    return new YieldRate({ inputWeight: totalInput, outputWeight: totalOutput, unit: this._unit });
  }

  compareTo(other: YieldRate): number {
    return this._value - other._value;
  }

  isBetterThan(other: YieldRate): boolean {
    return this._value > other._value;
  }

  toJSON(): YieldRateProps {
    return {
      inputWeight: this._inputWeight,
      outputWeight: this._outputWeight,
      unit: this._unit,
    };
  }

  equals(other: YieldRate): boolean {
    return this._inputWeight === other._inputWeight
      && this._outputWeight === other._outputWeight
      && this._value === other._value;
  }

  toString(): string {
    return `${this._value}% (${this._outputWeight}/${this._inputWeight} ${this._unit})`;
  }
}