export interface LotNumberProps {
  prefix: string;
  sequence: number;
  year?: number;
  source?: string;
  separator?: string;
}

export class LotNumber {
  private _prefix: string;
  private _sequence: number;
  private _year: number | null;
  private _source: string | null;
  private _separator: string;

  private constructor(props: LotNumberProps) {
    this._prefix = props.prefix;
    this._sequence = props.sequence;
    this._year = props.year ?? null;
    this._source = props.source ?? null;
    this._separator = props.separator ?? '-';
  }

  static create(props: LotNumberProps): LotNumber {
    if (!props.prefix) throw new Error('Prefix is required');
    if (props.sequence < 0) throw new Error('Sequence cannot be negative');
    if (props.year != null && (props.year < 1900 || props.year > 2100)) throw new Error('Invalid year');
    return new LotNumber(props);
  }

  static generate(prefix: string, year?: number, source?: string): LotNumber {
    const seq = Math.floor(Math.random() * 900000) + 100000;
    return new LotNumber({ prefix, sequence: seq, year, source });
  }

  static zero(): LotNumber {
    return new LotNumber({ prefix: 'NONE', sequence: 0 });
  }

  get prefix(): string { return this._prefix; }
  get sequence(): number { return this._sequence; }
  get year(): number | null { return this._year; }
  get source(): string | null { return this._source; }
  get separator(): string { return this._separator; }

  get formatted(): string {
    const parts: string[] = [this._prefix];
    if (this._year) parts.push(String(this._year));
    parts.push(String(this._sequence).padStart(6, '0'));
    if (this._source) parts.push(this._source);
    return parts.join(this._separator);
  }

  get shortForm(): string {
    return `${this._prefix}${this._separator}${String(this._sequence).padStart(6, '0')}`;
  }

  next(): LotNumber {
    return new LotNumber({
      prefix: this._prefix,
      sequence: this._sequence + 1,
      year: this._year ?? undefined,
      source: this._source ?? undefined,
      separator: this._separator,
    });
  }

  toJSON(): LotNumberProps {
    return {
      prefix: this._prefix,
      sequence: this._sequence,
      year: this._year ?? undefined,
      source: this._source ?? undefined,
      separator: this._separator,
    };
  }

  equals(other: LotNumber): boolean {
    return this._prefix === other._prefix
      && this._sequence === other._sequence
      && this._year === other._year
      && this._source === other._source;
  }

  toString(): string {
    return this.formatted;
  }
}
