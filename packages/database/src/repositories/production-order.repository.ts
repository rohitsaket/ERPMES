import { BaseRepository } from './base.repository.js';
import { ProductionOrder, ProductionOrderRepository as ProductionOrderRepositoryInterface } from '@diamondflow/domain';
import { Prisma } from '@prisma/client';

export class ProductionOrderRepository extends BaseRepository<
  ProductionOrder,
  Prisma.ProductionOrderGetPayload<{ include: { operations: true } }>,
  Prisma.ProductionOrderCreateInput,
  Prisma.ProductionOrderUpdateInput,
  Prisma.ProductionOrderWhereUniqueInput,
  Prisma.ProductionOrderWhereInput
> implements ProductionOrderRepositoryInterface {
  protected modelDelegate = prisma.productionOrder;
  protected modelName = 'ProductionOrder';

  async findBySalesOrderLine(salesOrderLineId: string): Promise<ProductionOrder[]> {
    const records = await this.client.productionOrder.findMany({
      where: { salesOrderLineId, deletedAt: null },
      include: { operations: true },
      orderBy: { createdAt: 'asc' },
    });
    return records.map((r) => this.toDomain(r));
  }

  async findByStatus(status: string, scope?: { companyId?: string; factoryId?: string }): Promise<ProductionOrder[]> {
    const where: any = { status, deletedAt: null };
    if (scope?.factoryId) where.factoryId = scope.factoryId;
    const records = await this.client.productionOrder.findMany({
      where,
      include: { operations: true },
      orderBy: { priority: 'desc' },
    });
    return records.map((r) => this.toDomain(r));
  }

  async findReleased(scope?: { companyId?: string; factoryId?: string }): Promise<ProductionOrder[]> {
    return this.findByStatus('released', scope);
  }

  async findInProgress(scope?: { companyId?: string; factoryId?: string }): Promise<ProductionOrder[]> {
    return this.findByStatus('in_progress', scope);
  }

  async findByDepartment(departmentId: string, scope?: { companyId?: string }): Promise<ProductionOrder[]> {
    const records = await this.client.productionOrder.findMany({
      where: {
        operations: { some: { departmentId } },
        deletedAt: null,
      },
      include: { operations: true },
    });
    return records.map((r) => this.toDomain(r));
  }

  async findByPriority(priority: string, scope?: { companyId?: string }): Promise<ProductionOrder[]> {
    const records = await this.client.productionOrder.findMany({
      where: { priority, status: { in: ['released', 'in_progress'] }, deletedAt: null },
      include: { operations: true },
      orderBy: { plannedStartDate: 'asc' },
    });
    return records.map((r) => this.toDomain(r));
  }

  protected toDomain(record: any): ProductionOrder {
    return {
      id: record.id,
      companyId: record.companyId,
      salesOrderLineId: record.salesOrderLineId,
      productId: record.productId,
      routingId: record.routingId,
      number: record.number,
      qty: record.qty,
      uom: record.uom,
      status: record.status,
      priority: record.priority,
      plannedStartDate: record.plannedStartDate,
      plannedEndDate: record.plannedEndDate,
      actualStartDate: record.actualStartDate,
      actualEndDate: record.actualEndDate,
      notes: record.notes,
      createdAt: record.createdAt,
      createdBy: record.createdBy,
      releasedAt: record.releasedAt,
      completedAt: record.completedAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
      operations: record.operations?.map((op: any) => ({
        id: op.id,
        seq: op.seq,
        departmentId: op.departmentId,
        workCenterId: op.workCenterId,
        status: op.status,
        setupMin: op.setupMin,
        runMin: op.runMin,
        qtyCompleted: op.qtyCompleted,
        qtyScrap: op.qtyScrap,
        weightIn: op.weightIn?.toNumber(),
        weightOut: op.weightOut?.toNumber(),
        yieldPct: op.yieldPct,
        startedAt: op.startedAt,
        completedAt: op.completedAt,
        operatorId: op.operatorId,
      })) || [],
    };
  }
}