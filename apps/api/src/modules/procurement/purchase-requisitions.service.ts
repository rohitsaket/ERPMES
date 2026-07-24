import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { CreatePurchaseRequisitionDto, UpdatePurchaseRequisitionDto, QueryPurchaseRequisitionDto } from './dto/purchase-requisition.dto';

const prisma = new PrismaClient() as any;

@Injectable()
export class PurchaseRequisitionsService {
  async create(dto: CreatePurchaseRequisitionDto) {
    const { lines, ...data } = dto;
    return prisma.purchaseRequisition.create({
      data: {
        companyId: data.companyId,
        status: 'DRAFT',
        lines: {
          create: lines.map((l) => ({
            itemId: l.itemId,
            itemName: l.itemName,
            qty: l.qty,
            uom: l.uom,
            neededBy: new Date(l.neededBy),
          })),
        },
      },
      include: { lines: true },
    });
  }

  async findAll(query: QueryPurchaseRequisitionDto) {
    const { page = 1, limit = 20, status, companyId } = query;
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };
    if (companyId) where.companyId = companyId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.purchaseRequisition.findMany({ where, skip, take: limit, include: { lines: true }, orderBy: { createdAt: 'desc' } }),
      prisma.purchaseRequisition.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const pr = await prisma.purchaseRequisition.findUnique({ where: { id }, include: { lines: true } });
    if (!pr || pr.deletedAt) throw new NotFoundException(`Requisition ${id} not found`);
    return pr;
  }

  async update(id: string, dto: UpdatePurchaseRequisitionDto) {
    try {
      if (dto.lines) {
        await prisma.prLine.deleteMany({ where: { requisitionId: id } });
        return prisma.purchaseRequisition.update({
          where: { id },
          data: {
            status: dto.status,
            lines: { create: dto.lines.map((l) => ({ ...l, neededBy: new Date(l.neededBy) })) },
          },
          include: { lines: true },
        });
      }
      return prisma.purchaseRequisition.update({
        where: { id },
        data: { status: dto.status },
        include: { lines: true },
      });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') throw new NotFoundException(`Requisition ${id} not found`);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await prisma.purchaseRequisition.update({ where: { id }, data: { deletedAt: new Date() } });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') throw new NotFoundException(`Requisition ${id} not found`);
      throw error;
    }
  }

  async submit(id: string) {
    return this.update(id, { status: 'SUBMITTED' });
  }

  async approve(id: string) {
    return this.update(id, { status: 'APPROVED' });
  }
}
