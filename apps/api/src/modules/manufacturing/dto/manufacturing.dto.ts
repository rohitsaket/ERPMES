export class CreateOperationDto {
  productionOrderId!: string;
  seq!: number;
  departmentId!: string;
  workCenterId?: string;
  employeeId?: string;
  setupMin?: number;
  runMin?: number;
}

export class UpdateOperationDto {
  status?: string;
  workCenterId?: string;
  employeeId?: string;
  weightIn?: number;
  weightOut?: number;
  qtyGood?: number;
  qtyScrap?: number;
  notes?: string;
}

export class QueryOperationDto {
  page?: number;
  limit?: number;
  status?: string;
  departmentId?: string;
  workCenterId?: string;
  productionOrderId?: string;
}

export class CompleteOperationDto {
  qtyGood!: number;
  qtyScrap!: number;
  weightIn!: number;
  weightOut!: number;
}

export class CreateDiamondDto {
  companyId!: string;
  certificateNo!: string;
  carat!: number;
  color!: string;
  clarity!: string;
  cut!: string;
  shape!: string;
  origin?: string;
  currentPacketId?: string;
}

export class UpdateDiamondDto {
  status?: string;
  currentOwnerId?: string;
  currentPacketId?: string;
  currentDeptId?: string;
  currentEmployeeId?: string;
}

export class QueryDiamondDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  currentPacketId?: string;
  companyId?: string;
}

export class CreatePacketDto {
  factoryId!: string;
  location?: string;
}

export class UpdatePacketDto {
  status?: string;
  location?: string;
}
