export class CreatePurchaseOrderDto {
  companyId!: string;
  vendorId!: string;
  lines!: CreatePoLineDto[];
}

export class CreatePoLineDto {
  itemId!: string;
  itemName!: string;
  qty!: number;
  uom!: string;
  unitPrice!: number;
  dueDate!: string;
}

export class UpdatePurchaseOrderDto {
  status?: string;
}

export class QueryPurchaseOrderDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  vendorId?: string;
  companyId?: string;
}
