export interface CertificateNumberProps {
  issuingLab: string;
  number: string;
  year?: number;
}

export class CertificateNumber {
  private _issuingLab: string;
  private _number: string;
  private _year: number | null;

  private readonly VALID_LABS: string[] = [
    'GIA', 'IGI', 'HRD', 'AGS', 'EGL', 'IIDGR',
  ];

  private constructor(props: CertificateNumberProps) {
    this._issuingLab = props.issuingLab.toUpperCase();
    this._number = props.number;
    this._year = props.year ?? null;
  }

  static create(props: CertificateNumberProps): CertificateNumber {
    if (!props.issuingLab) throw new Error('Issuing lab is required');
    if (!props.number) throw new Error('Certificate number is required');
    if (props.year != null && (props.year < 1900 || props.year > 2100)) throw new Error('Invalid certificate year');
    return new CertificateNumber(props);
  }

  static zero(): CertificateNumber {
    return new CertificateNumber({ issuingLab: 'GIA', number: '-', year: new Date().getFullYear() });
  }

  get issuingLab(): string { return this._issuingLab; }
  get number(): string { return this._number; }
  get year(): number | null { return this._year; }

  get fullNumber(): string {
    if (this._year) {
      return `${this._issuingLab}-${this._year}-${this._number}`;
    }
    return `${this._issuingLab}-${this._number}`;
  }

  toJSON(): CertificateNumberProps {
    return {
      issuingLab: this._issuingLab,
      number: this._number,
      year: this._year ?? undefined,
    };
  }

  equals(other: CertificateNumber): boolean {
    return this._issuingLab === other._issuingLab
      && this._number === other._number
      && this._year === other._year;
  }

  toString(): string {
    return this.fullNumber;
  }
}