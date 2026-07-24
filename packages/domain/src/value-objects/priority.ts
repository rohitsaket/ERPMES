export type PriorityLevel = 'low' | 'normal' | 'high' | 'urgent' | 'critical';

const VALID_PRIORITIES: PriorityLevel[] = ['low', 'normal', 'high', 'urgent', 'critical'];

const PRIORITY_ORDER: Record<PriorityLevel, number> = {
  low: 0,
  normal: 1,
  high: 2,
  urgent: 3,
  critical: 4,
};

export interface PriorityProps {
  level: PriorityLevel;
}

export class Priority {
  private _level: PriorityLevel;

  private constructor(props: PriorityProps) {
    this._level = props.level;
  }

  static create(props: PriorityProps): Priority {
    if (!VALID_PRIORITIES.includes(props.level)) throw new Error(`Invalid priority level: ${props.level}`);
    return new Priority(props);
  }

  static zero(): Priority {
    return new Priority({ level: 'normal' });
  }

  static low(): Priority {
    return new Priority({ level: 'low' });
  }

  static normal(): Priority {
    return new Priority({ level: 'normal' });
  }

  static high(): Priority {
    return new Priority({ level: 'high' });
  }

  static urgent(): Priority {
    return new Priority({ level: 'urgent' });
  }

  static critical(): Priority {
    return new Priority({ level: 'critical' });
  }

  get level(): PriorityLevel {
    return this._level;
  }

  get order(): number {
    return PRIORITY_ORDER[this._level];
  }

  isHigherThan(other: Priority): boolean {
    return PRIORITY_ORDER[this._level] > PRIORITY_ORDER[other._level];
  }

  isLowerThan(other: Priority): boolean {
    return PRIORITY_ORDER[this._level] < PRIORITY_ORDER[other._level];
  }

  isAtLeast(other: Priority): boolean {
    return PRIORITY_ORDER[this._level] >= PRIORITY_ORDER[other._level];
  }

  toJSON(): PriorityProps {
    return {
      level: this._level,
    };
  }

  equals(other: Priority): boolean {
    return this._level === other._level;
  }

  toString(): string {
    return this._level;
  }
}