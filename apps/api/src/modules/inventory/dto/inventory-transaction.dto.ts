export class CreateInventoryTransactionDto {
  lotId!: string;
  type!: string;
  qty!: number;
  uom!: string;
  refType?: string;
  refId?: string;
  fromLocation?: string;
  toLocation?: string;
  employeeId?: string;
  weightBefore?: number;
  weightAfter?: number;
}

export class QueryInventoryTransactionDto {
  page?: number;
  limit?: number;
  lotId?: string;
  type?: string;
  refType?: string;
  refId?: string;
}

export class TransferDto {
  lotId!: string;
  fromWarehouseId!: string;
  toWarehouseId!: string;
  qty!: number;
  uom!: string;
  employeeId?: string;
}

export class AdjustmentDto {
  lotId!: string;
  newQty!: number;
  uom!: string;
  reason!: string;
  employeeId?: string;
}
