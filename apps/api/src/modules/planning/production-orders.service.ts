import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { CreateProductionOrderDto, UpdateProductionOrderDto, QueryProductionOrderDto, CreateOperationDto, UpdateOperationDto } from './dto/production-order.dto';

const prisma = new PrismaClient() as any;

@Injectable()
export class ProductionOrdersService {
  async create(dto: CreateProductionOrderDto) {
    const { operations, ...orderData } = dto;

    return prisma.productionOrder.create({
      data: {
        companyId: orderData.companyId,
        productId: orderData.productId,
        salesOrderLineId: orderData.salesOrderLineId,
        qty: orderData.qty,
        priority: orderData.priority ?? 0,
        status: 'PLANNED',
        startDate: orderData.startDate ? new Date(orderData.startDate) : null,
        dueDate: orderData.dueDate ? new Date(orderData.dueDate) : null,
        routingId: orderData.routingId,
        operations: operations?.length
          ? { create: operations.map(({ workCenterId, ...rest }) => ({
              ...rest,
              workCenterId: workCenterId ?? undefined,
            })) }
          : undefined,
      },
      include: { operations: { orderBy: { seq: 'asc' } }, jobCards: true },
    });
  }

  async findAll(query: QueryProductionOrderDto) {
    const { page = 1, limit = 20, search, status, productId, companyId } = query;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (companyId) where.companyId = companyId;
    if (status) where.status = status;
    if (productId) where.productId = productId;
    if (search) {
      where.OR = [{ id: { contains: search, mode: 'insensitive' } }];
    }

    const [data, total] = await Promise.all([
      prisma.productionOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { operations: { orderBy: { seq: 'asc' } }, jobCards: true },
      }),
      prisma.productionOrder.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const order = await prisma.productionOrder.findUnique({
      where: { id },
      include: { operations: { orderBy: { seq: 'asc' } }, jobCards: true },
    });

    if (!order || order.deletedAt) {
      throw new NotFoundException(`ProductionOrder with ID ${id} not found`);
    }

    return order;
  }

  async update(id: string, dto: UpdateProductionOrderDto) {
    try {
      return await prisma.productionOrder.update({
        where: { id },
        data: {
          qty: dto.qty,
          priority: dto.priority,
          status: dto.status,
          startDate: dto.startDate ? new Date(dto.startDate) : undefined,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
          routingId: dto.routingId,
        },
        include: { operations: { orderBy: { seq: 'asc' } }, jobCards: true },
      });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') {
        throw new NotFoundException(`ProductionOrder with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await prisma.productionOrder.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') {
        throw new NotFoundException(`ProductionOrder with ID ${id} not found`);
      }
      throw error;
    }
  }

  async addOperation(orderId: string, dto: CreateOperationDto) {
    const order = await prisma.productionOrder.findUnique({ where: { id: orderId } });
    if (!order || order.deletedAt) {
      throw new NotFoundException(`ProductionOrder with ID ${orderId} not found`);
    }

    return prisma.productionOrderOperation.create({
      data: {
        orderId,
        seq: dto.seq,
        departmentId: dto.departmentId,
        workCenterId: dto.workCenterId,
        setupMin: dto.setupMin,
        runMin: dto.runMin,
        status: 'QUEUED',
      },
    });
  }

  async updateOperation(orderId: string, opId: string, dto: UpdateOperationDto) {
    try {
      return await prisma.productionOrderOperation.update({
        where: { id: opId, orderId },
        data: {
          workCenterId: dto.workCenterId,
          setupMin: dto.setupMin,
          runMin: dto.runMin,
          status: dto.status,
          qtyComplete: dto.qtyComplete,
          qtyScrap: dto.qtyScrap,
          weightIn: dto.weightIn,
          weightOut: dto.weightOut,
        },
      });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') {
        throw new NotFoundException(`Operation with ID ${opId} not found on this order`);
      }
      throw error;
    }
  }

  async release(id: string) {
    return this.update(id, { status: 'RELEASED' });
  }

  async cancel(id: string) {
    return this.update(id, { status: 'CANCELLED' });
  }
}
