export interface StatusProps {
  code: string;
  display: string;
  transitions: string[];
}

export interface StatusTransition {
  from: string;
  to: string;
  allowed: boolean;
}

export class Status {
  private _code: string;
  private _display: string;
  private _transitions: ReadonlySet<string>;

  private constructor(props: StatusProps) {
    this._code = props.code;
    this._display = props.display;
    this._transitions = new Set(props.transitions);
  }

  static create(props: StatusProps): Status {
    if (!props.code) throw new Error('Status code is required');
    if (!props.display) throw new Error('Status display is required');
    if (!Array.isArray(props.transitions)) throw new Error('Transitions must be an array');
    return new Status(props);
  }

  static zero(): Status {
    return new Status({ code: 'draft', display: 'Draft', transitions: [] });
  }

  get code(): string {
    return this._code;
  }

  get display(): string {
    return this._display;
  }

  get transitions(): ReadonlySet<string> {
    return this._transitions;
  }

  canTransitionTo(targetStatus: Status): boolean {
    return this._transitions.has(targetStatus._code);
  }

  transitionTo(targetStatus: Status): StatusTransition {
    return {
      from: this._code,
      to: targetStatus._code,
      allowed: this.canTransitionTo(targetStatus),
    };
  }

  getAllowedTransitions(allStatuses: Status[]): Status[] {
    return allStatuses.filter(s => this._transitions.has(s._code));
  }

  toJSON(): StatusProps {
    return {
      code: this._code,
      display: this._display,
      transitions: Array.from(this._transitions),
    };
  }

  equals(other: Status): boolean {
    return this._code === other._code;
  }

  toString(): string {
    return this._display;
  }
}