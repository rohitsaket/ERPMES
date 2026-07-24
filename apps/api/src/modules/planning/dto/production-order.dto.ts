export class CreateProductionOrderDto {
  companyId!: string;
  productId!: string;
  salesOrderLineId?: string;
  qty!: number;
  priority?: number;
  startDate?: string;
  dueDate?: string;
  routingId?: string;
  operations?: CreateOperationDto[];
}

export class CreateOperationDto {
  seq!: number;
  departmentId!: string;
  workCenterId?: string;
  setupMin!: number;
  runMin!: number;
}

export class UpdateProductionOrderDto {
  qty?: number;
  priority?: number;
  startDate?: string;
  dueDate?: string;
  routingId?: string;
  status?: string;
}

export class UpdateOperationDto {
  workCenterId?: string;
  setupMin?: number;
  runMin?: number;
  status?: string;
  qtyComplete?: number;
  qtyScrap?: number;
  weightIn?: number;
  weightOut?: number;
}

export class QueryProductionOrderDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  productId?: string;
  companyId?: string;
}
