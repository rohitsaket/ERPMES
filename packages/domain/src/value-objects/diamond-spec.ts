export type DiamondColor =
  | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M'
  | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z';

export type DiamondClarity =
  | 'FL' | 'IF'
  | 'VVS1' | 'VVS2'
  | 'VS1' | 'VS2'
  | 'SI1' | 'SI2'
  | 'I1' | 'I2' | 'I3';

export type DiamondCut = 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor';

export type DiamondShape =
  | 'round' | 'princess' | 'emerald' | 'oval' | 'marquise'
  | 'pear' | 'heart' | 'cushion' | 'radiant' | 'asscher';

const VALID_COLORS: DiamondColor[] = [
  'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
];

const VALID_CLARITIES: DiamondClarity[] = [
  'FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3',
];

const VALID_CUTS: DiamondCut[] = [
  'Excellent', 'Very Good', 'Good', 'Fair', 'Poor',
];

const VALID_SHAPES: DiamondShape[] = [
  'round', 'princess', 'emerald', 'oval', 'marquise',
  'pear', 'heart', 'cushion', 'radiant', 'asscher',
];

export interface DiamondSpecProps {
  carat: number;
  color: DiamondColor;
  clarity: DiamondClarity;
  cut: DiamondCut;
  shape: DiamondShape;
  origin?: string;
}

export class DiamondSpec {
  private _carat: number;
  private _color: DiamondColor;
  private _clarity: DiamondClarity;
  private _cut: DiamondCut;
  private _shape: DiamondShape;
  private _origin: string | null;

  private constructor(props: DiamondSpecProps) {
    this._carat = Number(props.carat.toFixed(4));
    this._color = props.color;
    this._clarity = props.clarity;
    this._cut = props.cut;
    this._shape = props.shape;
    this._origin = props.origin ?? null;
  }

  static create(props: DiamondSpecProps): DiamondSpec {
    if (props.carat <= 0) throw new Error('Carat must be greater than 0');
    if (!VALID_COLORS.includes(props.color)) throw new Error(`Invalid diamond color: ${props.color}`);
    if (!VALID_CLARITIES.includes(props.clarity)) throw new Error(`Invalid diamond clarity: ${props.clarity}`);
    if (!VALID_CUTS.includes(props.cut)) throw new Error(`Invalid diamond cut: ${props.cut}`);
    if (!VALID_SHAPES.includes(props.shape)) throw new Error(`Invalid diamond shape: ${props.shape}`);
    return new DiamondSpec(props);
  }

  static zero(): DiamondSpec {
    return new DiamondSpec({ carat: 0, color: 'D', clarity: 'FL', cut: 'Excellent', shape: 'round' });
  }

  get carat(): number {
    return this._carat;
  }

  get color(): DiamondColor {
    return this._color;
  }

  get clarity(): DiamondClarity {
    return this._clarity;
  }

  get cut(): DiamondCut {
    return this._cut;
  }

  get shape(): DiamondShape {
    return this._shape;
  }

  get origin(): string | null {
    return this._origin;
  }

  toJSON(): DiamondSpecProps {
    return {
      carat: this._carat,
      color: this._color,
      clarity: this._clarity,
      cut: this._cut,
      shape: this._shape,
      origin: this._origin ?? undefined,
    };
  }

  equals(other: DiamondSpec): boolean {
    return this._carat === other._carat
      && this._color === other._color
      && this._clarity === other._clarity
      && this._cut === other._cut
      && this._shape === other._shape
      && this._origin === other._origin;
  }

  toString(): string {
    const parts = [
      `${this._carat.toFixed(2)}ct`,
      this._color,
      this._clarity,
      this._cut,
      this._shape,
    ];
    if (this._origin) parts.push(this._origin);
    return parts.join(' ');
  }
}