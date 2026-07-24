export interface OEEAvailabilityProps {
  plannedProductionTime: number;
  actualRunTime: number;
}

export interface OEEPerformanceProps {
  idealCycleTime: number;
  totalPartsProduced: number;
  actualRunTime: number;
}

export interface OEEQualityProps {
  totalPartsProduced: number;
  goodPartsProduced: number;
}

export interface OEEMetricsProps {
  availability: number;
  performance: number;
  quality: number;
  oee?: number;
}

export class OEEMetrics {
  private _availability: number;
  private _performance: number;
  private _quality: number;
  private _oee: number;

  private constructor(props: OEEMetricsProps) {
    this._availability = Number(props.availability.toFixed(4));
    this._performance = Number(props.performance.toFixed(4));
    this._quality = Number(props.quality.toFixed(4));
    this._oee = Number((props.oee ?? props.availability * props.performance * props.quality).toFixed(4));
  }

  static create(props: OEEMetricsProps): OEEMetrics {
    if (props.availability < 0 || props.availability > 1) throw new Error('Availability must be between 0 and 1');
    if (props.performance < 0 || props.performance > 1) throw new Error('Performance must be between 0 and 1');
    if (props.quality < 0 || props.quality > 1) throw new Error('Quality must be between 0 and 1');
    return new OEEMetrics(props);
  }

  static fromComponents(
    availability: OEEAvailabilityProps,
    performance: OEEPerformanceProps,
    quality: OEEQualityProps,
  ): OEEMetrics {
    const a = availability.plannedProductionTime > 0
      ? availability.actualRunTime / availability.plannedProductionTime
      : 0;
    const p = performance.actualRunTime > 0
      ? (performance.idealCycleTime * performance.totalPartsProduced) / performance.actualRunTime
      : 0;
    const q = quality.totalPartsProduced > 0
      ? quality.goodPartsProduced / quality.totalPartsProduced
      : 0;
    return new OEEMetrics({ availability: a, performance: p, quality: q, oee: a * p * q });
  }

  static zero(): OEEMetrics {
    return new OEEMetrics({ availability: 0, performance: 0, quality: 0, oee: 0 });
  }

  static perfect(): OEEMetrics {
    return new OEEMetrics({ availability: 1, performance: 1, quality: 1, oee: 1 });
  }

  get availability(): number {
    return this._availability;
  }

  get performance(): number {
    return this._performance;
  }

  get quality(): number {
    return this._quality;
  }

  get oee(): number {
    return this._oee;
  }

  get availabilityPercent(): number {
    return Number((this._availability * 100).toFixed(1));
  }

  get performancePercent(): number {
    return Number((this._performance * 100).toFixed(1));
  }

  get qualityPercent(): number {
    return Number((this._quality * 100).toFixed(1));
  }

  get oeePercent(): number {
    return Number((this._oee * 100).toFixed(1));
  }

  toJSON(): OEEMetricsProps {
    return {
      availability: this._availability,
      performance: this._performance,
      quality: this._quality,
      oee: this._oee,
    };
  }

  equals(other: OEEMetrics): boolean {
    return this._availability === other._availability
      && this._performance === other._performance
      && this._quality === other._quality;
  }

  toString(): string {
    return `OEE: ${this.oeePercent}% (A: ${this.availabilityPercent}%, P: ${this.performancePercent}%, Q: ${this.qualityPercent}%)`;
  }
}