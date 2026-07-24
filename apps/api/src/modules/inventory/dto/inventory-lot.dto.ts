export class CreateInventoryLotDto {
  companyId!: string;
  itemId!: string;
  itemName!: string;
  warehouseId!: string;
  qty!: number;
  uom!: string;
  lotNumber!: string;
  expiryDate?: string;
  certificateId?: string;
}

export class UpdateInventoryLotDto {
  qty?: number;
  status?: string;
  certificateId?: string;
}

export class QueryInventoryLotDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  warehouseId?: string;
  itemId?: string;
  companyId?: string;
}
