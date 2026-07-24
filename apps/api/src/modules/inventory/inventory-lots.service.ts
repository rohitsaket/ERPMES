import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { CreateInventoryLotDto, UpdateInventoryLotDto, QueryInventoryLotDto } from './dto/inventory-lot.dto';

const prisma = new PrismaClient() as any;

@Injectable()
export class InventoryLotsService {
  async create(dto: CreateInventoryLotDto) {
    return prisma.inventoryLot.create({
      data: {
        companyId: dto.companyId,
        itemId: dto.itemId,
        itemName: dto.itemName,
        warehouseId: dto.warehouseId,
        qty: dto.qty,
        uom: dto.uom,
        status: 'AVAILABLE',
        lotNumber: dto.lotNumber,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        certificateId: dto.certificateId,
      },
      include: { warehouse: true },
    });
  }

  async findAll(query: QueryInventoryLotDto) {
    const { page = 1, limit = 20, search, status, warehouseId, itemId, companyId } = query;
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };
    if (companyId) where.companyId = companyId;
    if (status) where.status = status;
    if (warehouseId) where.warehouseId = warehouseId;
    if (itemId) where.itemId = itemId;
    if (search) {
      where.OR = [
        { lotNumber: { contains: search, mode: 'insensitive' } },
        { itemName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.inventoryLot.findMany({ where, skip, take: limit, include: { warehouse: true }, orderBy: { createdAt: 'desc' } }),
      prisma.inventoryLot.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const lot = await prisma.inventoryLot.findUnique({ where: { id }, include: { warehouse: true, transactions: { orderBy: { timestamp: 'desc' }, take: 50 } } });
    if (!lot || lot.deletedAt) throw new NotFoundException(`Lot ${id} not found`);
    return lot;
  }

  async update(id: string, dto: UpdateInventoryLotDto) {
    try {
      return await prisma.inventoryLot.update({ where: { id }, data: dto, include: { warehouse: true } });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') throw new NotFoundException(`Lot ${id} not found`);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await prisma.inventoryLot.update({ where: { id }, data: { deletedAt: new Date() } });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') throw new NotFoundException(`Lot ${id} not found`);
      throw error;
    }
  }

  async getSummary(companyId: string) {
    const lots = await prisma.inventoryLot.findMany({ where: { companyId, deletedAt: null } });
    const totalQty = lots.reduce((s: number, l: { qty: any }) => s + Number(l.qty), 0);
    const byStatus = lots.reduce((acc: Record<string, number>, l: { status: string; qty: any }) => { acc[l.status] = (acc[l.status] || 0) + Number(l.qty); return acc; }, {} as Record<string, number>);
    return { totalLots: lots.length, totalQty, byStatus };
  }
}
