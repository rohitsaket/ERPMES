export class CreatePurchaseRequisitionDto {
  companyId!: string;
  lines!: CreatePrLineDto[];
}

export class CreatePrLineDto {
  itemId!: string;
  itemName!: string;
  qty!: number;
  uom!: string;
  neededBy!: string;
}

export class UpdatePurchaseRequisitionDto {
  status?: string;
  lines?: CreatePrLineDto[];
}

export class QueryPurchaseRequisitionDto {
  page?: number;
  limit?: number;
  status?: string;
  companyId?: string;
}
