export interface CapacityProps {
  totalHours: number;
  bookedHours?: number;
  plannedMaintenanceHours?: number;
}

export class Capacity {
  private _totalHours: number;
  private _bookedHours: number;
  private _plannedMaintenanceHours: number;

  private constructor(props: CapacityProps) {
    this._totalHours = props.totalHours;
    this._bookedHours = props.bookedHours ?? 0;
    this._plannedMaintenanceHours = props.plannedMaintenanceHours ?? 0;
  }

  static create(props: CapacityProps): Capacity {
    if (props.totalHours < 0) throw new Error('Total hours cannot be negative');
    if (props.bookedHours != null && props.bookedHours < 0) throw new Error('Booked hours cannot be negative');
    if (props.plannedMaintenanceHours != null && props.plannedMaintenanceHours < 0) throw new Error('Planned maintenance hours cannot be negative');
    return new Capacity(props);
  }

  static zero(): Capacity {
    return new Capacity({ totalHours: 0 });
  }

  static full(totalHours: number, bookedHours?: number, plannedMaintenanceHours?: number): Capacity {
    return new Capacity({ totalHours, bookedHours, plannedMaintenanceHours });
  }

  get totalHours(): number {
    return this._totalHours;
  }

  get bookedHours(): number {
    return this._bookedHours;
  }

  get plannedMaintenanceHours(): number {
    return this._plannedMaintenanceHours;
  }

  get availableHours(): number {
    return Math.max(0, this._totalHours - this._bookedHours - this._plannedMaintenanceHours);
  }

  get usedHours(): number {
    return this._bookedHours + this._plannedMaintenanceHours;
  }

  get load(): number {
    if (this._totalHours === 0) return 0;
    return Number(((this.usedHours / this._totalHours) * 100).toFixed(2));
  }

  get isOverloaded(): boolean {
    return this.availableHours < 0;
  }

  book(hours: number): Capacity {
    return new Capacity({
      totalHours: this._totalHours,
      bookedHours: this._bookedHours + hours,
      plannedMaintenanceHours: this._plannedMaintenanceHours,
    });
  }

  unbook(hours: number): Capacity {
    const newBooked = Math.max(0, this._bookedHours - hours);
    return new Capacity({
      totalHours: this._totalHours,
      bookedHours: newBooked,
      plannedMaintenanceHours: this._plannedMaintenanceHours,
    });
  }

  canAccommodate(hours: number): boolean {
    return this.availableHours >= hours;
  }

  toJSON(): CapacityProps {
    return {
      totalHours: this._totalHours,
      bookedHours: this._bookedHours,
      plannedMaintenanceHours: this._plannedMaintenanceHours,
    };
  }

  equals(other: Capacity): boolean {
    return this._totalHours === other._totalHours
      && this._bookedHours === other._bookedHours
      && this._plannedMaintenanceHours === other._plannedMaintenanceHours;
  }

  toString(): string {
    return `${this.availableHours}h available / ${this._totalHours}h total (${this.load}% load)`;
  }
}