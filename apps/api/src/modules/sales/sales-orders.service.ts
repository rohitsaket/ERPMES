import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient() as any;

@Injectable()
export class SalesOrdersService {
  async create(createSalesOrderDto: any) {
    const { lines, customerId, companyId, quotationId, requiredDate } = createSalesOrderDto;
    const normalizedLines = lines.map((line: any) => {
      const qty = Math.max(1, Math.trunc(Number(line.qty)));
      const unitPrice = Number(line.unitPrice);
      return {
        productId: line.productId,
        qty,
        uom: line.uom,
        unitPrice,
        lineTotal: qty * unitPrice,
        dueDate: line.dueDate ? new Date(line.dueDate) : null,
      };
    });

    const order = await prisma.salesOrder.create({
      data: {
        companyId,
        customerId,
        quotationId,
        number: `SO-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        status: 'draft',
        requestedDate: requiredDate ? new Date(requiredDate) : new Date(),
        totalAmount: normalizedLines.reduce(
          (sum: number, line: { lineTotal: number }) => sum + line.lineTotal,
          0,
        ),
        lines: {
          create: normalizedLines,
        },
      },
      include: { lines: true, customer: true },
    });

    return order;
  }

  async findAll(query: any) {
    const { page = 1, limit = 20, status, companyId, customerId } = query;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (companyId) where.companyId = companyId;
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.salesOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          lines: true,
          _count: { select: { lines: true, allocations: true } },
        },
      }),
      prisma.salesOrder.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const order = await prisma.salesOrder.findUnique({
      where: { id },
      include: {
        lines: true,
        customer: true,
        quotation: { include: { lines: true } },
        invoice: true,
        shipment: true,
      },
    });

    if (!order || order.deletedAt) {
      throw new NotFoundException(`Sales order with ID ${id} not found`);
    }

    return order;
  }

  async update(id: string, updateSalesOrderDto: any) {
    const existing = await prisma.salesOrder.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Sales order with ID ${id} not found`);
    }

    const { lines, ...data } = updateSalesOrderDto;

    if (lines) {
      await prisma.salesOrderLine.deleteMany({ where: { salesOrderId: id } });
      await prisma.salesOrderLine.createMany({
        data: lines.map((line: any) => ({
          salesOrderId: id,
          productId: line.productId,
          qty: Math.max(1, Math.trunc(Number(line.qty))),
          uom: line.uom,
          unitPrice: Number(line.unitPrice),
          lineTotal:
            Math.max(1, Math.trunc(Number(line.qty))) *
            Number(line.unitPrice),
          dueDate: line.dueDate ? new Date(line.dueDate) : null,
        })),
      });
    }

    return prisma.salesOrder.update({
      where: { id },
      data: {
        customerId: data.customerId,
        status: data.status,
        requestedDate: data.requiredDate
          ? new Date(data.requiredDate)
          : undefined,
      },
      include: { lines: true, customer: true },
    });
  }

  async remove(id: string) {
    try {
      return await prisma.salesOrder.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error: unknown) {
      const code = error instanceof Error && 'code' in error
        ? (error as Error & { code: string }).code
        : undefined;
      if (code === 'P2025') {
        throw new NotFoundException(`Sales order with ID ${id} not found`);
      }
      throw error;
    }
  }
}
