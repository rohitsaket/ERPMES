import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type {
  CreateReturnAuthDto, UpdateReturnAuthDto, ReturnAuthQueryDto,
  CreateRepairOrderDto, UpdateRepairOrderDto, RepairOrderQueryDto,
  CreateRedispatchDto,
} from './dto/returns.dto';

const prisma = new PrismaClient() as any;

@Injectable()
export class ReturnsService {
  // ---- Return Authorizations ----

  async createReturnAuth(dto: CreateReturnAuthDto) {
    const { lines, ...data } = dto;
    return prisma.returnAuthorization.create({
      data: {
        ...data,
        number: `RA-${Date.now()}`,
        status: 'draft',
        lines: { create: lines.map((l) => ({ diamondId: l.diamondId, qty: Math.trunc(l.qty), reason: l.reason })) },
      },
      include: { lines: true },
    });
  }

  async findAllReturnAuths(query: ReturnAuthQueryDto) {
    const { page = 1, limit = 20, status, companyId, customerId } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (companyId) where.companyId = companyId;
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.returnAuthorization.findMany({
        where, skip, take: limit,
        include: { _count: { select: { lines: true } }, receipt: true, repair: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.returnAuthorization.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOneReturnAuth(id: string) {
    const ra = await prisma.returnAuthorization.findUnique({
      where: { id },
      include: { lines: true, receipt: true, repair: { include: { redispatch: true } } },
    });
    if (!ra) throw new NotFoundException(`Return authorization ${id} not found`);
    return ra;
  }

  async updateReturnAuth(id: string, dto: UpdateReturnAuthDto) {
    try {
      return await prisma.returnAuthorization.update({
        where: { id },
        data: { status: dto.status },
        include: { lines: true, receipt: true, repair: true },
      });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') throw new NotFoundException(`Return authorization ${id} not found`);
      throw error;
    }
  }

  async receiveReturnAuth(id: string) {
    try {
      return await prisma.returnAuthorization.update({ where: { id }, data: { status: 'RECEIVED' }, include: { lines: true } });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') throw new NotFoundException(`Return authorization ${id} not found`);
      throw error;
    }
  }

  // ---- Repair Orders ----

  async createRepairOrder(dto: CreateRepairOrderDto) {
    const ra = await prisma.returnAuthorization.findUnique({ where: { id: dto.returnAuthId } });
    if (!ra) throw new NotFoundException(`Return authorization ${dto.returnAuthId} not found`);
    const existingRepair = await prisma.repairOrder.findUnique({ where: { returnAuthId: dto.returnAuthId } });
    if (existingRepair) throw new BadRequestException('Return authorization already has a repair order');

    return prisma.repairOrder.create({
      data: {
        companyId: ra.companyId,
        returnAuthId: dto.returnAuthId,
        productionOrderId: dto.productionOrderId,
        status: 'open',
      },
      include: { returnAuth: { select: { id: true, customerId: true, status: true } } },
    });
  }

  async findAllRepairOrders(query: RepairOrderQueryDto) {
    const { page = 1, limit = 20, status } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.repairOrder.findMany({
        where, skip, take: limit,
        include: { returnAuth: true, redispatch: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.repairOrder.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOneRepairOrder(id: string) {
    const ro = await prisma.repairOrder.findUnique({
      where: { id },
      include: { returnAuth: { include: { lines: true, receipt: true } }, redispatch: true },
    });
    if (!ro) throw new NotFoundException(`Repair order ${id} not found`);
    return ro;
  }

  async updateRepairOrder(id: string, dto: UpdateRepairOrderDto) {
    const data: Record<string, unknown> = { ...dto };
    if (data.completedAt) data.completedAt = new Date(data.completedAt as string);
    try {
      return await prisma.repairOrder.update({ where: { id }, data, include: { returnAuth: true, redispatch: true } });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') throw new NotFoundException(`Repair order ${id} not found`);
      throw error;
    }
  }

  async createRedispatch(repairOrderId: string, dto: CreateRedispatchDto) {
    const ro = await prisma.repairOrder.findUnique({ where: { id: repairOrderId } });
    if (!ro) throw new NotFoundException(`Repair order ${repairOrderId} not found`);
    if (ro.status !== 'COMPLETED') throw new BadRequestException('Repair order must be completed before redispatch');
    const existingRedispatch = await prisma.redispatch.findUnique({ where: { repairOrderId } });
    if (existingRedispatch) throw new BadRequestException('Repair order already has a redispatch');

    return prisma.redispatch.create({
      data: { companyId: ro.companyId, repairOrderId, shipmentId: dto.shipmentId, status: 'pending' },
      include: { repairOrder: true },
    });
  }
}
