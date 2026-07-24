import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const softDeleteModels = [
  'Company', 'Branch', 'Factory', 'Warehouse', 'Department', 'WorkCenter',
  'Product', 'Bom', 'Routing', 'Customer', 'Vendor',
  'Quotation', 'SalesOrder', 'PurchaseOrder', 'GoodsReceipt',
  'InventoryLot', 'Diamond', 'DiamondPacket', 'Operation',
  'InspectionPlan', 'QualityInspection', 'Nonconformance', 'Certificate',
  'Asset', 'WorkOrder', 'Bag', 'Shipment', 'Invoice', 'Payment',
  'ChartOfAccount', 'JournalEntry', 'ReturnAuthorization', 'RepairOrder',
  'User',
];

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Soft delete middleware
prisma.$use(async (params, next) => {
  if (params.action === 'delete' && softDeleteModels.includes(params.model || '')) {
    params.action = 'update';
    params.args.data = { deletedAt: new Date() };
  }

  if (params.action === 'deleteMany' && softDeleteModels.includes(params.model || '')) {
    params.action = 'updateMany';
    params.args.data = { deletedAt: new Date() };
  }

  return next(params);
});

// Org-scope filter middleware
let currentOrgScope: {
  companyId?: string;
  branchId?: string;
  factoryId?: string;
  departmentId?: string;
} = {};

export function setOrgScope(scope: {
  companyId?: string;
  branchId?: string;
  factoryId?: string;
  departmentId?: string;
}) {
  currentOrgScope = scope;
}

export function clearOrgScope() {
  currentOrgScope = {};
}

prisma.$use(async (params, next) => {
  const { action, model } = params;
  
  // Apply org scope to read operations
  if (['findUnique', 'findFirst', 'findMany', 'count', 'aggregate', 'groupBy'].includes(action)) {
    if (currentOrgScope.companyId) {
      params.args = params.args || {};
      params.args.where = params.args.where || {};
      params.args.where.companyId = currentOrgScope.companyId;
    }
    if (currentOrgScope.factoryId) {
      params.args = params.args || {};
      params.args.where = params.args.where || {};
      params.args.where.factoryId = currentOrgScope.factoryId;
    }
    if (currentOrgScope.departmentId) {
      params.args = params.args || {};
      params.args.where = params.args.where || {};
      params.args.where.departmentId = currentOrgScope.departmentId;
    }
  }

  // Exclude soft-deleted records by default
  if (softDeleteModels.includes(model || '')) {
    if (['findUnique', 'findFirst', 'findMany'].includes(action)) {
      params.args = params.args || {};
      params.args.where = params.args.where || {};
      if (params.args.where.deletedAt === undefined) {
        params.args.where.deletedAt = null;
      }
    }
  }

  return next(params);
});
