import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { CreateOperationDto, UpdateOperationDto, QueryOperationDto, CompleteOperationDto } from './dto/manufacturing.dto';

const prisma = new PrismaClient() as any;

@Injectable()
export class OperationsService {
  async create(dto: CreateOperationDto) {
    return prisma.operation.create({
      data: { ...dto, status: 'QUEUED' },
      include: { department: true, workCenter: true },
    });
  }

  async findAll(query: QueryOperationDto) {
    const { page = 1, limit = 20, status, departmentId, workCenterId, productionOrderId } = query;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;
    if (departmentId) where.departmentId = departmentId;
    if (workCenterId) where.workCenterId = workCenterId;
    if (productionOrderId) where.productionOrderId = productionOrderId;

    const [data, total] = await Promise.all([
      prisma.operation.findMany({
        where,
        skip,
        take: limit,
        include: { department: true, workCenter: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.operation.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const op = await prisma.operation.findUnique({
      where: { id },
      include: { department: true, workCenter: true },
    });
    if (!op) throw new NotFoundException(`Operation ${id} not found`);
    return op;
  }

  async update(id: string, dto: UpdateOperationDto) {
    try {
      return await prisma.operation.update({ where: { id }, data: dto, include: { department: true, workCenter: true } });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') throw new NotFoundException(`Operation ${id} not found`);
      throw error;
    }
  }

  async start(id: string) { return this.update(id, { status: 'RUNNING' }); }
  async pause(id: string) { return this.update(id, { status: 'PAUSED' }); }
  async resume(id: string) { return this.update(id, { status: 'RUNNING' }); }
  async hold(id: string) { return this.update(id, { status: 'HELD' }); }

  async complete(id: string, dto: CompleteOperationDto) {
    try {
      return await prisma.operation.update({
        where: { id },
        data: { status: 'COMPLETED', qtyGood: dto.qtyGood, qtyScrap: dto.qtyScrap, weightIn: dto.weightIn, weightOut: dto.weightOut, completedAt: new Date() },
        include: { department: true, workCenter: true },
      });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') throw new NotFoundException(`Operation ${id} not found`);
      throw error;
    }
  }

  async getShopFloor(factoryId: string) {
    const activeOps = await prisma.operation.findMany({
      where: {
        factoryId,
        status: { in: ['QUEUED', 'RUNNING', 'PAUSED', 'HELD'] },
      },
      include: { department: true, workCenter: true },
      orderBy: { createdAt: 'asc' },
    });
    const departments = await prisma.department.findMany({ where: { factoryId } });
    type Department = typeof departments[0];
    type Operation = typeof activeOps[0];
    const byDept = departments.map((d: Department) => ({
      department: d,
      operations: activeOps.filter((o: Operation) => o.departmentId === d.id),
    }));
    return { totalActive: activeOps.length, byDepartment: byDept };
  }
}
