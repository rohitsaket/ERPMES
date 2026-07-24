export type DurationUnit = 'minute' | 'hour' | 'day';

export interface DurationProps {
  value: number;
  unit: DurationUnit;
}

export class Duration {
  private _value: number;
  private _unit: DurationUnit;

  private readonly MINUTES_PER_UNIT: Record<DurationUnit, number> = {
    minute: 1,
    hour: 60,
    day: 1440,
  };

  private constructor(props: DurationProps) {
    this._value = props.value;
    this._unit = props.unit;
  }

  static create(props: DurationProps): Duration {
    if (props.value < 0) throw new Error('Duration value cannot be negative');
    const validUnits: DurationUnit[] = ['minute', 'hour', 'day'];
    if (!validUnits.includes(props.unit)) throw new Error(`Invalid duration unit: ${props.unit}`);
    return new Duration(props);
  }

  static zero(unit: DurationUnit = 'minute'): Duration {
    return new Duration({ value: 0, unit });
  }

  get value(): number {
    return this._value;
  }

  get unit(): DurationUnit {
    return this._unit;
  }

  toMinutes(): number {
    return this._value * this.MINUTES_PER_UNIT[this._unit];
  }

  toHours(): number {
    return Number((this.toMinutes() / 60).toFixed(4));
  }

  toDays(): number {
    return Number((this.toMinutes() / 1440).toFixed(4));
  }

  convert(targetUnit: DurationUnit): Duration {
    const inMinutes = this.toMinutes();
    const converted = inMinutes / this.MINUTES_PER_UNIT[targetUnit];
    return new Duration({ value: Number(converted.toFixed(4)), unit: targetUnit });
  }

  add(other: Duration): Duration {
    const totalMinutes = this.toMinutes() + other.toMinutes();
    return new Duration({ value: totalMinutes, unit: 'minute' });
  }

  subtract(other: Duration): Duration {
    const totalMinutes = this.toMinutes() - other.toMinutes();
    if (totalMinutes < 0) throw new Error('Subtraction would result in negative duration');
    return new Duration({ value: totalMinutes, unit: 'minute' });
  }

  lessThan(other: Duration): boolean {
    return this.toMinutes() < other.toMinutes();
  }

  greaterThan(other: Duration): boolean {
    return this.toMinutes() > other.toMinutes();
  }

  toJSON(): DurationProps {
    return {
      value: this._value,
      unit: this._unit,
    };
  }

  equals(other: Duration): boolean {
    return this.toMinutes() === other.toMinutes();
  }

  toString(): string {
    return `${this._value} ${this._unit}${this._value === 1 ? '' : 's'}`;
  }
}