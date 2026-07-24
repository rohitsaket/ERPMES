export interface AddressProps {
  street1: string;
  street2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export class Address {
  private _street1: string;
  private _street2: string | null;
  private _city: string;
  private _state: string | null;
  private _postalCode: string;
  private _country: string;

  private constructor(props: AddressProps) {
    this._street1 = props.street1;
    this._street2 = props.street2 ?? null;
    this._city = props.city;
    this._state = props.state ?? null;
    this._postalCode = props.postalCode;
    this._country = props.country;
  }

  static create(props: AddressProps): Address {
    if (!props.street1) throw new Error('street1 is required');
    if (!props.city) throw new Error('city is required');
    if (!props.postalCode) throw new Error('postalCode is required');
    if (!props.country) throw new Error('country is required');
    return new Address(props);
  }

  static zero(): Address {
    return new Address({ street1: '-', city: '-', postalCode: '-', country: '-' });
  }

  get street1(): string { return this._street1; }
  get street2(): string | null { return this._street2; }
  get city(): string { return this._city; }
  get state(): string | null { return this._state; }
  get postalCode(): string { return this._postalCode; }
  get country(): string { return this._country; }

  get fullStreet(): string {
    return this._street2 ? `${this._street1}, ${this._street2}` : this._street1;
  }

  get cityStatePostal(): string {
    const parts: string[] = [this._city];
    if (this._state) parts.push(this._state);
    parts.push(this._postalCode);
    return parts.join(', ');
  }

  toJSON(): AddressProps {
    return {
      street1: this._street1,
      street2: this._street2 ?? undefined,
      city: this._city,
      state: this._state ?? undefined,
      postalCode: this._postalCode,
      country: this._country,
    };
  }

  equals(other: Address): boolean {
    return this._street1 === other._street1
      && this._street2 === other._street2
      && this._city === other._city
      && this._state === other._state
      && this._postalCode === other._postalCode
      && this._country === other._country;
  }

  toString(): string {
    return [this.fullStreet, this.cityStatePostal, this._country].filter(Boolean).join(', ');
  }
}