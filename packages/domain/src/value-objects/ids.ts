import { ValueObject } from '../value-objects';

abstract class StringId extends ValueObject {
  protected constructor(public readonly value: string) {
    super();
    if (!value) throw new Error('ID value cannot be empty');
  }

  protected override equalsCore(other: ValueObject): boolean {
    return other instanceof StringId && this.value === other.value;
  }

  override toString(): string {
    return this.value;
  }
}

export class CompanyId extends StringId {
  private constructor(value: string) { super(value); }
  static generate(): CompanyId { return new CompanyId(crypto.randomUUID()); }
  static fromString(value: string): CompanyId { return new CompanyId(value); }
}
export class BranchId extends StringId {
  private constructor(value: string) { super(value); }
  static generate(): BranchId { return new BranchId(crypto.randomUUID()); }
  static fromString(value: string): BranchId { return new BranchId(value); }
}
export class FactoryId extends StringId {
  private constructor(value: string) { super(value); }
  static generate(): FactoryId { return new FactoryId(crypto.randomUUID()); }
  static fromString(value: string): FactoryId { return new FactoryId(value); }
}
export class WarehouseId extends StringId {
  private constructor(value: string) { super(value); }
  static generate(): WarehouseId { return new WarehouseId(crypto.randomUUID()); }
  static fromString(value: string): WarehouseId { return new WarehouseId(value); }
}
export class DepartmentId extends StringId {
  private constructor(value: string) { super(value); }
  static generate(): DepartmentId { return new DepartmentId(crypto.randomUUID()); }
  static fromString(value: string): DepartmentId { return new DepartmentId(value); }
}
export class WorkCenterId extends StringId {
  private constructor(value: string) { super(value); }
  static generate(): WorkCenterId { return new WorkCenterId(crypto.randomUUID()); }
  static fromString(value: string): WorkCenterId { return new WorkCenterId(value); }
}
export class ProductId extends StringId {
  private constructor(value: string) { super(value); }
  static generate(): ProductId { return new ProductId(crypto.randomUUID()); }
  static fromString(value: string): ProductId { return new ProductId(value); }
}
export class RoutingId extends StringId {
  private constructor(value: string) { super(value); }
  static generate(): RoutingId { return new RoutingId(crypto.randomUUID()); }
  static fromString(value: string): RoutingId { return new RoutingId(value); }
}
export class RoutingConfigId extends StringId {
  private constructor(value: string) { super(value); }
  static generate(): RoutingConfigId { return new RoutingConfigId(crypto.randomUUID()); }
  static fromString(value: string): RoutingConfigId { return new RoutingConfigId(value); }
}
export class BomId extends StringId {
  private constructor(value: string) { super(value); }
  static generate(): BomId { return new BomId(crypto.randomUUID()); }
  static fromString(value: string): BomId { return new BomId(value); }
}
export class DiamondId extends StringId {
  private constructor(value: string) { super(value); }
  static generate(): DiamondId { return new DiamondId(crypto.randomUUID()); }
  static fromString(value: string): DiamondId { return new DiamondId(value); }
}
export class DiamondPacketId extends StringId {
  private constructor(value: string) { super(value); }
  static generate(): DiamondPacketId { return new DiamondPacketId(crypto.randomUUID()); }
  static fromString(value: string): DiamondPacketId { return new DiamondPacketId(value); }
}
export class CustomerId extends StringId {
  private constructor(value: string) { super(value); }
  static generate(): CustomerId { return new CustomerId(crypto.randomUUID()); }
  static fromString(value: string): CustomerId { return new CustomerId(value); }
}
export class VendorId extends StringId {
  private constructor(value: string) { super(value); }
  static generate(): VendorId { return new VendorId(crypto.randomUUID()); }
  static fromString(value: string): VendorId { return new VendorId(value); }
}
export class ProductionOrderId extends StringId {
  private constructor(value: string) { super(value); }
  static generate(): ProductionOrderId { return new ProductionOrderId(crypto.randomUUID()); }
  static fromString(value: string): ProductionOrderId { return new ProductionOrderId(value); }
}
export class InspectionPlanId extends StringId {
  private constructor(value: string) { super(value); }
  static generate(): InspectionPlanId { return new InspectionPlanId(crypto.randomUUID()); }
  static fromString(value: string): InspectionPlanId { return new InspectionPlanId(value); }
}
export class InspectionId extends StringId {
  private constructor(value: string) { super(value); }
  static generate(): InspectionId { return new InspectionId(crypto.randomUUID()); }
  static fromString(value: string): InspectionId { return new InspectionId(value); }
}
export class NonconformanceId extends StringId {
  private constructor(value: string) { super(value); }
  static generate(): NonconformanceId { return new NonconformanceId(crypto.randomUUID()); }
  static fromString(value: string): NonconformanceId { return new NonconformanceId(value); }
}
export class CertificateId extends StringId {
  private constructor(value: string) { super(value); }
  static generate(): CertificateId { return new CertificateId(crypto.randomUUID()); }
  static fromString(value: string): CertificateId { return new CertificateId(value); }
}
export class InventoryLotId extends StringId {
  private constructor(value: string) { super(value); }
  static generate(): InventoryLotId { return new InventoryLotId(crypto.randomUUID()); }
  static fromString(value: string): InventoryLotId { return new InventoryLotId(value); }
}
export class BagId extends StringId {
  private constructor(value: string) { super(value); }
  static generate(): BagId { return new BagId(crypto.randomUUID()); }
  static fromString(value: string): BagId { return new BagId(value); }
}
