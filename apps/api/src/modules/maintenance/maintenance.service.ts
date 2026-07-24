import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type {
  CreateAssetDto, UpdateAssetDto, AssetQueryDto,
  CreateWorkOrderDto, UpdateWorkOrderDto, WorkOrderQueryDto,
  CreatePmScheduleDto, UpdatePmScheduleDto, PmScheduleQueryDto,
} from './dto/maintenance.dto';

const prisma = new PrismaClient() as any;

@Injectable()
export class MaintenanceService {
  // ---- Assets ----

  async createAsset(dto: CreateAssetDto) {
    const factory = await prisma.factory.findUnique({ where: { id: dto.factoryId } });
    if (!factory) throw new NotFoundException(`Factory ${dto.factoryId} not found`);
    return prisma.asset.create({
      data: {
        companyId: factory.companyId,
        factoryId: dto.factoryId,
        name: dto.name,
        code: `${dto.name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toUpperCase()}-${Date.now()}`,
        assetType: dto.type,
        criticality: dto.criticality,
      },
    });
  }

  async findAllAssets(query: AssetQueryDto) {
    const { page = 1, limit = 20, factoryId, type, criticality } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (factoryId) where.factoryId = factoryId;
    if (type) where.assetType = type;
    if (criticality) where.criticality = criticality;

    const [data, total] = await Promise.all([
      prisma.asset.findMany({
        where, skip, take: limit,
        include: { _count: { select: { workOrders: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.asset.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOneAsset(id: string) {
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: { workOrders: { include: { tasks: true }, orderBy: { createdAt: 'desc' } }, pmSchedule: true },
    });
    if (!asset) throw new NotFoundException(`Asset ${id} not found`);
    return asset;
  }

  async updateAsset(id: string, dto: UpdateAssetDto) {
    try {
      const { type, ...data } = dto;
      return await prisma.asset.update({
        where: { id },
        data: { ...data, assetType: type },
      });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') throw new NotFoundException(`Asset ${id} not found`);
      throw error;
    }
  }

  async removeAsset(id: string) {
    try {
      await prisma.asset.update({ where: { id }, data: { status: 'retired' } });
      return { deleted: true };
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') throw new NotFoundException(`Asset ${id} not found`);
      throw error;
    }
  }

  // ---- Work Orders ----

  async createWorkOrder(dto: CreateWorkOrderDto) {
    const { tasks, ...data } = dto;
    return prisma.workOrder.create({
      data: {
        ...data,
        status: 'OPEN',
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        tasks: tasks ? { create: tasks.map((t) => ({ seq: t.seq, description: t.description, estimatedHours: t.estimatedHours })) } : undefined,
      },
      include: { asset: { select: { id: true, name: true } }, tasks: { orderBy: { seq: 'asc' } } },
    });
  }

  async findAllWorkOrders(query: WorkOrderQueryDto) {
    const { page = 1, limit = 20, assetId, status, assignedTo, type } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (assetId) where.assetId = assetId;
    if (status) where.status = status;
    if (assignedTo) where.assignedTo = assignedTo;
    if (type) where.type = type;

    const [data, total] = await Promise.all([
      prisma.workOrder.findMany({
        where, skip, take: limit,
        include: { asset: { select: { id: true, name: true } }, _count: { select: { tasks: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.workOrder.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOneWorkOrder(id: string) {
    const wo = await prisma.workOrder.findUnique({
      where: { id },
      include: { asset: true, tasks: { orderBy: { seq: 'asc' } } },
    });
    if (!wo) throw new NotFoundException(`Work order ${id} not found`);
    return wo;
  }

  async updateWorkOrder(id: string, dto: UpdateWorkOrderDto | Record<string, unknown>) {
    const data: Record<string, unknown> = { ...dto };
    if (data.dueDate) data.dueDate = new Date(data.dueDate as string);
    if (data.completedAt) data.completedAt = new Date(data.completedAt as string);
    try {
      return await prisma.workOrder.update({
        where: { id },
        data,
        include: { asset: { select: { id: true, name: true } }, tasks: { orderBy: { seq: 'asc' } } },
      });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') throw new NotFoundException(`Work order ${id} not found`);
      throw error;
    }
  }

  async completeTask(workOrderId: string, dto: { seq: number; actualHours: number; completedBy: string }) {
    const task = await prisma.woTask.findUnique({ where: { workOrderId_seq: { workOrderId, seq: dto.seq } } });
    if (!task) throw new NotFoundException(`Task with seq ${dto.seq} in work order ${workOrderId} not found`);

    return prisma.woTask.update({
      where: { workOrderId_seq: { workOrderId, seq: dto.seq } },
      data: { actualHours: dto.actualHours, completedAt: new Date(), completedBy: dto.completedBy },
    });
  }

  // ---- PM Schedules ----

  async createPmSchedule(dto: CreatePmScheduleDto) {
    const asset = await prisma.asset.findUnique({ where: { id: dto.assetId } });
    if (!asset) throw new NotFoundException(`Asset ${dto.assetId} not found`);
    const schedule = await prisma.preventiveMaintenanceSchedule.create({
      data: {
        companyId: asset.companyId,
        name: `${asset.name} preventive maintenance`,
        frequencyType: dto.frequency.toLowerCase(),
        frequencyValue: 1,
        tasks: dto.tasks ?? undefined,
      },
    });
    await prisma.asset.update({ where: { id: dto.assetId }, data: { pmScheduleId: schedule.id } });
    return prisma.preventiveMaintenanceSchedule.findUnique({
      where: { id: schedule.id },
      include: { assets: { select: { id: true, name: true, assetType: true, criticality: true } } },
    });
  }

  async findAllPmSchedules(query: PmScheduleQueryDto) {
    const { page = 1, limit = 20, frequency, assetId } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (frequency) where.frequencyType = frequency.toLowerCase();
    if (assetId) where.assets = { some: { id: assetId } };

    const [data, total] = await Promise.all([
      prisma.preventiveMaintenanceSchedule.findMany({
        where, skip, take: limit,
        include: { assets: { select: { id: true, name: true, assetType: true, criticality: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.preventiveMaintenanceSchedule.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOnePmSchedule(id: string) {
    const pm = await prisma.preventiveMaintenanceSchedule.findUnique({
      where: { id },
      include: { assets: true },
    });
    if (!pm) throw new NotFoundException(`PM schedule ${id} not found`);
    return pm;
  }

  async updatePmSchedule(id: string, dto: UpdatePmScheduleDto) {
    const data: Record<string, unknown> = {};
    if (dto.frequency !== undefined) data.frequencyType = dto.frequency.toLowerCase();
    if (dto.tasks !== undefined) data.tasks = dto.tasks;
    try {
      return await prisma.preventiveMaintenanceSchedule.update({
        where: { id },
        data,
        include: { assets: { select: { id: true, name: true } } },
      });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') throw new NotFoundException(`PM schedule ${id} not found`);
      throw error;
    }
  }

  async completePmRun(id: string, nextRun: string) {
    try {
      return await prisma.preventiveMaintenanceSchedule.update({
        where: { id },
        data: { status: 'active' },
        include: { assets: { select: { id: true, name: true } } },
      });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') throw new NotFoundException(`PM schedule ${id} not found`);
      throw error;
    }
  }
}
