import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { CreateInventoryTransactionDto, QueryInventoryTransactionDto, TransferDto, AdjustmentDto } from './dto/inventory-transaction.dto';

const prisma = new PrismaClient() as any;

@Injectable()
export class InventoryTransactionsService {
  async create(dto: CreateInventoryTransactionDto) {
    return prisma.inventoryTransaction.create({ data: dto as any });
  }

  async findAll(query: QueryInventoryTransactionDto) {
    const { page = 1, limit = 20, lotId, type, refType, refId } = query;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (lotId) where.lotId = lotId;
    if (type) where.type = type;
    if (refType) where.refType = refType;
    if (refId) where.refId = refId;

    const [data, total] = await Promise.all([
      prisma.inventoryTransaction.findMany({
        where,
        skip,
        take: limit,
        include: { lot: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.inventoryTransaction.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async transfer(dto: TransferDto) {
    const { lotId, qty, uom, employeeId } = dto;

    const lot = await prisma.inventoryLot.findUnique({ where: { id: lotId } });
    if (!lot || lot.deletedAt) throw new NotFoundException(`Lot ${lotId} not found`);

    const fromQty = Number(lot.qty);
    if (qty > fromQty) throw new Error('Insufficient quantity');

    const transferAmount = -Math.abs(qty);

    await prisma.inventoryLot.update({
      where: { id: lotId },
      data: { qty: { decrement: transferAmount } },
    });

    return prisma.inventoryTransaction.create({
      data: {
        lotId,
        type: 'TRANSFER_OUT',
        qty: transferAmount,
        uom,
        fromLocation: dto.fromWarehouseId,
        toLocation: dto.toWarehouseId,
        employeeId,
      },
    });
  }

  async adjust(dto: AdjustmentDto) {
    const { lotId, newQty, uom, reason, employeeId } = dto;

    const lot = await prisma.inventoryLot.findUnique({ where: { id: lotId } });
    if (!lot || lot.deletedAt) throw new NotFoundException(`Lot ${lotId} not found`);

    await prisma.inventoryLot.update({ where: { id: lotId }, data: { qty: newQty } });

    return prisma.inventoryTransaction.create({
      data: {
        lotId,
        type: 'ADJUSTMENT',
        qty: newQty - Number(lot.qty),
        uom,
        refType: 'ADJUSTMENT',
        refId: reason,
        employeeId,
        weightBefore: Number(lot.qty),
        weightAfter: newQty,
      },
    });
  }
}
