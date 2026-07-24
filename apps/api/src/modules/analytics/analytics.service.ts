import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { AnalyticsQueryDto, CustomReportDto, CustomReportQueryDto } from './dto/analytics.dto';

const prisma = new PrismaClient() as any;

interface YieldDepartment {
  id: string;
  name: string;
}

interface YieldOperation {
  departmentId?: string | null;
  yieldPct?: number | string | null;
}

export function aggregateYieldByDepartment(
  departments: YieldDepartment[],
  operations: YieldOperation[],
) {
  const grouped = new Map<string, { totalYield: number; operations: number }>();

  for (const department of departments) {
    if (!grouped.has(department.name)) {
      grouped.set(department.name, { totalYield: 0, operations: 0 });
    }

    const departmentOperations = operations.filter(
      (operation) => operation.departmentId === department.id,
    );
    const aggregate = grouped.get(department.name)!;
    aggregate.totalYield += departmentOperations.reduce(
      (sum, operation) => sum + (Number(operation.yieldPct) || 0),
      0,
    );
    aggregate.operations += departmentOperations.length;
  }

  return Array.from(grouped, ([department, aggregate]) => ({
    department,
    yieldPct:
      aggregate.operations > 0
        ? Math.round((aggregate.totalYield / aggregate.operations) * 100) / 100
        : 0,
    operations: aggregate.operations,
  }));
}

@Injectable()
export class AnalyticsService {
  // ---- OEE (Overall Equipment Effectiveness) ----

  async getOee(query: AnalyticsQueryDto) {
    const { factoryId, dateFrom, dateTo, workCenterId } = query;
    const where: Record<string, unknown> = {
      status: { in: ['running', 'paused', 'held', 'completed', 'RUNNING', 'PAUSED', 'HELD', 'COMPLETED'] },
    };
    if (factoryId) {
      const departments = await prisma.department.findMany({ where: { factoryId }, select: { id: true } });
      where.departmentId = { in: departments.map((d: { id: string }) => d.id) };
    }
    if (workCenterId) where.workCenterId = workCenterId;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) (where.createdAt as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) (where.createdAt as Record<string, unknown>).lte = new Date(dateTo);
    }

    const operations = await prisma.operation.findMany({ where });
    const plannedMinutes = operations.reduce((sum: number, op: any) => sum + (op.setupMin ?? 0) + (op.runMin ?? 0), 0);
    const runningOps = operations.filter((op: any) =>
      ['running', 'completed'].includes(String(op.status).toLowerCase()),
    );
    const actualMinutes = runningOps.reduce((sum: number, op: any) => sum + (op.setupMin ?? 0) + (op.runMin ?? 0), 0);
    const goodQty = operations.reduce((sum: number, op: any) => sum + (op.qtyGood ?? 0), 0);
    const totalQty = operations.reduce((sum: number, op: any) => sum + (op.qtyGood ?? 0) + (op.qtyScrap ?? 0), 0);
    const quality = totalQty > 0 ? goodQty / totalQty : 0;
    const availability = plannedMinutes > 0 ? actualMinutes / plannedMinutes : 0;
    const performance = actualMinutes > 0 ? goodQty / actualMinutes : 0;
    const oee = availability * performance * quality;

    return {
      overallOEE: Math.round(oee * 10000) / 100,
      availability: Math.round(availability * 10000) / 100,
      performance: Math.round(performance * 10000) / 100,
      quality: Math.round(quality * 10000) / 100,
      plannedMinutes,
      actualMinutes,
      goodQty,
      totalQty,
      operationsCount: operations.length,
    };
  }

  // ---- Yield Analysis ----

  async getYield(query: AnalyticsQueryDto) {
    const { factoryId, dateFrom, dateTo, departmentId } = query;
    const where: Record<string, unknown> = { yieldPct: { not: null } };
    if (factoryId) {
      const depts = await prisma.department.findMany({ where: { factoryId }, select: { id: true } });
      where.departmentId = { in: depts.map((d: { id: string }) => d.id) };
    }
    if (departmentId) where.departmentId = departmentId;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) (where.createdAt as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) (where.createdAt as Record<string, unknown>).lte = new Date(dateTo);
    }

    const ops = await prisma.operation.findMany({ where });
    const byDept = await prisma.department.findMany({ where: { factoryId: factoryId || undefined }, select: { id: true, name: true } });
    const yieldByDept = aggregateYieldByDepartment(byDept, ops);

    const totalYield = ops.length > 0 ? ops.reduce((s: number, o: any) => s + (Number(o.yieldPct) || 0), 0) / ops.length : 0;
    return { overallYield: Math.round(totalYield * 100) / 100, byDepartment: yieldByDept, operationsAnalyzed: ops.length };
  }

  // ---- On-Time Delivery ----

  async getOtd(query: AnalyticsQueryDto) {
    const { factoryId, dateFrom, dateTo } = query;
    const where: Record<string, unknown> = { status: { in: ['delivered', 'shipped', 'DELIVERED', 'SHIPPED'] } };
    if (factoryId) where.companyId = factoryId;
    if (dateFrom || dateTo) {
      where.dispatchedAt = {};
      if (dateFrom) (where.dispatchedAt as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) (where.dispatchedAt as Record<string, unknown>).lte = new Date(dateTo);
    }

    const shipments = await prisma.shipment.findMany({ where, include: { bags: { include: { diamonds: true } } } });
    const onTime = shipments.reduce((count: number, s: any) => {
      const delivered = s.deliveredAt ? new Date(s.deliveredAt) : null;
      const promised = s.dispatchedAt ? new Date(s.dispatchedAt) : null;
      return count + (delivered && promised && delivered <= promised ? 1 : 0);
    }, 0);
    const total = shipments.length;
    return { onTimeDeliveryPct: total > 0 ? Math.round((onTime / total) * 10000) / 100 : 0, totalShipments: total, onTimeShipments: onTime };
  }

  // ---- WIP Aging ----

  async getWipAging(query: AnalyticsQueryDto) {
    const { factoryId, dateFrom, dateTo, departmentId } = query;
    const where: Record<string, unknown> = {
      status: { in: ['queued', 'running', 'paused', 'held', 'QUEUED', 'RUNNING', 'PAUSED', 'HELD'] },
    };
    if (factoryId) {
      const depts = await prisma.department.findMany({ where: { factoryId }, select: { id: true } });
      where.departmentId = { in: depts.map((d: { id: string }) => d.id) };
    }
    if (departmentId) where.departmentId = departmentId;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) (where.createdAt as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) (where.createdAt as Record<string, unknown>).lte = new Date(dateTo);
    }

    const operations = await prisma.operation.findMany({ where, include: { department: true, workCenter: true } });
    const now = new Date();
    const aging = operations.map((op: any) => ({
      operationId: op.id,
      productionOrderId: op.productionOrderId,
      seq: op.seq,
      department: op.department?.name,
      workCenter: op.workCenter?.name,
      status: op.status,
      ageDays: Math.floor((now.getTime() - new Date(op.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
      ageHours: Math.floor((now.getTime() - new Date(op.createdAt).getTime()) / (1000 * 60 * 60)),
    }));

    const buckets = {
      '0-24h': aging.filter((a: any) => a.ageHours <= 24).length,
      '24-48h': aging.filter((a: any) => a.ageHours > 24 && a.ageHours <= 48).length,
      '48-72h': aging.filter((a: any) => a.ageHours > 48 && a.ageHours <= 72).length,
      '72h+': aging.filter((a: any) => a.ageHours > 72).length,
    };

    return { aging, buckets, totalWip: aging.length };
  }

  // ---- Capacity Utilization ----

  async getCapacity(query: AnalyticsQueryDto) {
    const { factoryId, dateFrom, dateTo, workCenterId } = query;
    const where: Record<string, unknown> = {
      status: { in: ['running', 'paused', 'held', 'completed', 'RUNNING', 'PAUSED', 'HELD', 'COMPLETED'] },
    };
    if (factoryId) {
      const depts = await prisma.department.findMany({ where: { factoryId }, select: { id: true } });
      where.departmentId = { in: depts.map((d: { id: string }) => d.id) };
    }
    if (workCenterId) where.workCenterId = workCenterId;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) (where.createdAt as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) (where.createdAt as Record<string, unknown>).lte = new Date(dateTo);
    }

    const operations = await prisma.operation.findMany({ where, include: { workCenter: true } });
    const workCenters = await prisma.workCenter.findMany({ where: { departmentId: { in: operations.map((o: any) => o.departmentId).filter(Boolean) } } });
    const byWorkCenter = workCenters.map((wc: any) => {
      const wcOps = operations.filter((o: any) => o.workCenterId === wc.id);
      const planned = wcOps.reduce((s: number, o: any) => s + (o.setupMin ?? 0) + (o.runMin ?? 0), 0);
      const actual = wcOps.filter((o: any) => ['running', 'completed'].includes(String(o.status).toLowerCase()))
        .reduce((s: number, o: any) => s + (o.setupMin ?? 0) + (o.runMin ?? 0), 0);
      const utilization = planned > 0 ? actual / planned : 0;
      return { workCenter: wc.name, utilization: Math.round(utilization * 10000) / 100, plannedMinutes: planned, actualMinutes: actual, operations: wcOps.length };
    });

    const totalPlanned = byWorkCenter.reduce((s: number, wc: any) => s + wc.plannedMinutes, 0);
    const totalActual = byWorkCenter.reduce((s: number, wc: any) => s + wc.actualMinutes, 0);
    return { overallUtilization: totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 10000) / 100 : 0, byWorkCenter, totalOperations: operations.length };
  }

  // ---- Custom Reports ----

  async createCustomReport(dto: CustomReportDto) {
    return { id: `report_${Date.now()}`, ...dto, createdAt: new Date().toISOString() };
  }

  async listCustomReports(query: CustomReportQueryDto) {
    return { data: [], meta: { page: query.page ?? 1, limit: query.limit ?? 20, total: 0, totalPages: 0 } };
  }

  async getCustomReport(id: string) {
    return { id, name: 'Sample Report', queryConfig: {}, createdAt: new Date().toISOString() };
  }

  async runCustomReport(id: string, query: AnalyticsQueryDto) {
    return { reportId: id, data: [], generatedAt: new Date().toISOString() };
  }
}
