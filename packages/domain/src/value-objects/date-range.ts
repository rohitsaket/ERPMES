export interface DateRangeProps {
  start: Date;
  end: Date;
  inclusiveStart?: boolean;
  inclusiveEnd?: boolean;
}

export class DateRange {
  private _start: Date;
  private _end: Date;
  private _inclusiveStart: boolean;
  private _inclusiveEnd: boolean;

  private constructor(props: DateRangeProps) {
    this._start = new Date(props.start.getTime());
    this._end = new Date(props.end.getTime());
    this._inclusiveStart = props.inclusiveStart ?? true;
    this._inclusiveEnd = props.inclusiveEnd ?? true;
  }

  static create(props: DateRangeProps): DateRange {
    if (props.start.getTime() > props.end.getTime()) throw new Error('Start date must be before or equal to end date');
    return new DateRange(props);
  }

  static zero(): DateRange {
    const now = new Date();
    return new DateRange({ start: now, end: now });
  }

  get start(): Date {
    return new Date(this._start.getTime());
  }

  get end(): Date {
    return new Date(this._end.getTime());
  }

  get inclusiveStart(): boolean {
    return this._inclusiveStart;
  }

  get inclusiveEnd(): boolean {
    return this._inclusiveEnd;
  }

  contains(date: Date): boolean {
    const time = date.getTime();
    const startTime = this._start.getTime();
    const endTime = this._end.getTime();
    const afterStart = this._inclusiveStart ? time >= startTime : time > startTime;
    const beforeEnd = this._inclusiveEnd ? time <= endTime : time < endTime;
    return afterStart && beforeEnd;
  }

  overlaps(other: DateRange): boolean {
    return this.contains(other._start) || this.contains(other._end)
      || other.contains(this._start) || other.contains(this._end);
  }

  durationMs(): number {
    return this._end.getTime() - this._start.getTime();
  }

  durationDays(): number {
    return Number((this.durationMs() / (1000 * 60 * 60 * 24)).toFixed(2));
  }

  toJSON(): DateRangeProps {
    return {
      start: this._start,
      end: this._end,
      inclusiveStart: this._inclusiveStart,
      inclusiveEnd: this._inclusiveEnd,
    };
  }

  equals(other: DateRange): boolean {
    return this._start.getTime() === other._start.getTime()
      && this._end.getTime() === other._end.getTime()
      && this._inclusiveStart === other._inclusiveStart
      && this._inclusiveEnd === other._inclusiveEnd;
  }

  toString(): string {
    const startBracket = this._inclusiveStart ? '[' : '(';
    const endBracket = this._inclusiveEnd ? ']' : ')';
    return `${startBracket}${this._start.toISOString()}, ${this._end.toISOString()}${endBracket}`;
  }
}