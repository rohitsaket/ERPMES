// Base value object class
export abstract class ValueObject {
  public equals(other: ValueObject): boolean {
    if (other === null || other === undefined) return false;
    if (!(other instanceof this.constructor)) return false;
    return this.equalsCore(other);
  }

  protected abstract equalsCore(other: ValueObject): boolean;
}