export interface MoneyProps {
  amount: number;
  currency: string;
  precision?: number;
}

export class Money {
  private _amount: number;
  private _currency: string;
  private _precision: number;

  private constructor(props: MoneyProps) {
    this._amount = props.amount;
    this._currency = props.currency.toUpperCase();
    this._precision = props.precision ?? (this._currency === 'USD' ? 2 : 4);
  }

  static create(props: MoneyProps): Money {
    if (props.amount < 0) throw new Error('Money amount cannot be negative');
    return new Money(props);
  }

  static zero(currency = 'USD'): Money {
    return new Money({ amount: 0, currency });
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): string {
    return this._currency;
  }

  get precision(): number {
    return this._precision;
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money({
      amount: this._amount + other._amount,
      currency: this._currency,
      precision: this._precision,
    });
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money({
      amount: this._amount - other._amount,
      currency: this._currency,
      precision: this._precision,
    });
  }

  multiply(factor: number): Money {
    return new Money({
      amount: this._amount * factor,
      currency: this._currency,
      precision: this._precision,
    });
  }

  private assertSameCurrency(other: Money): void {
    if (this._currency !== other._currency) {
      throw new Error(
        `Currency mismatch: ${this._currency} vs ${other._currency}`,
      );
    }
  }

  toJSON(): MoneyProps {
    return {
      amount: this._amount,
      currency: this._currency,
      precision: this._precision,
    };
  }

  equals(other: Money): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }

  toString(): string {
    return `${this._currency} ${this._amount.toFixed(this._precision)}`;
  }
}