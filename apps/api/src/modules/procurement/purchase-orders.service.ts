import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { CreatePurchaseOrderDto, UpdatePurchaseOrderDto, QueryPurchaseOrderDto } from './dto/purchase-order.dto';

const prisma = new PrismaClient() as any;

@Injectable()
export class PurchaseOrdersService {
  async create(dto: CreatePurchaseOrderDto) {
    const { lines, ...data } = dto;
    return prisma.purchaseOrder.create({
      data: {
        companyId: data.companyId,
        vendorId: data.vendorId,
        status: 'DRAFT',
        lines: {
          create: lines.map((l) => ({
            itemId: l.itemId,
            itemName: l.itemName,
            qty: l.qty,
            uom: l.uom,
            unitPrice: l.unitPrice,
            dueDate: new Date(l.dueDate),
          })),
        },
      },
      include: { lines: true, vendor: true },
    });
  }

  async findAll(query: QueryPurchaseOrderDto) {
    const { page = 1, limit = 20, search, status, vendorId, companyId } = query;
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };
    if (companyId) where.companyId = companyId;
    if (status) where.status = status;
    if (vendorId) where.vendorId = vendorId;
    if (search) where.OR = [{ id: { contains: search, mode: 'insensitive' } }];

    const [data, total] = await Promise.all([
      prisma.purchaseOrder.findMany({ where, skip, take: limit, include: { lines: true, vendor: true }, orderBy: { createdAt: 'desc' } }),
      prisma.purchaseOrder.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const po = await prisma.purchaseOrder.findUnique({ where: { id }, include: { lines: true, vendor: true, goodsReceipts: { include: { lines: true } } } });
    if (!po || po.deletedAt) throw new NotFoundException(`PurchaseOrder ${id} not found`);
    return po;
  }

  async update(id: string, dto: UpdatePurchaseOrderDto) {
    try {
      return await prisma.purchaseOrder.update({
        where: { id },
        data: { status: dto.status },
        include: { lines: true, vendor: true },
      });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') throw new NotFoundException(`PurchaseOrder ${id} not found`);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await prisma.purchaseOrder.update({ where: { id }, data: { deletedAt: new Date() } });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') throw new NotFoundException(`PurchaseOrder ${id} not found`);
      throw error;
    }
  }

  async place(id: string) {
    return this.update(id, { status: 'PLACED' });
  }

  async receive(id: string) {
    return this.update(id, { status: 'RECEIVED' });
  }
}
