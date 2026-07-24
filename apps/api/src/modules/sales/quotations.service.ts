import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient() as any;

@Injectable()
export class QuotationsService {
  async create(createQuotationDto: any) {
    const { lines, customerId, companyId, validUntil } = createQuotationDto;
    const normalizedLines = lines.map((line: any) => {
      const qty = Math.max(1, Math.trunc(Number(line.qty)));
      const unitPrice = Number(line.unitPrice);
      const discountPct = Number(line.discountPct ?? 0);
      return {
        productId: line.productId,
        qty,
        uom: line.uom,
        unitPrice,
        discountPct,
        lineTotal: qty * unitPrice * (1 - discountPct / 100),
      };
    });

    const quotation = await prisma.quotation.create({
      data: {
        companyId,
        customerId,
        number: `QT-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        status: 'draft',
        validUntil: validUntil ? new Date(validUntil) : null,
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

    return quotation;
  }

  async findAll(query: any) {
    const { page = 1, limit = 20, status, companyId, customerId } = query;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (companyId) where.companyId = companyId;
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.quotation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { customer: true, lines: true, _count: { select: { lines: true } } },
      }),
      prisma.quotation.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: { lines: true, customer: true },
    });

    if (!quotation || quotation.deletedAt) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }

    return quotation;
  }

  async update(id: string, updateQuotationDto: any) {
    const existing = await prisma.quotation.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }

    const { lines, ...data } = updateQuotationDto;

    if (lines) {
      await prisma.quotationLine.deleteMany({ where: { quotationId: id } });
      await prisma.quotationLine.createMany({
        data: lines.map((line: any) => ({
          quotationId: id,
          productId: line.productId,
          qty: Math.max(1, Math.trunc(Number(line.qty))),
          uom: line.uom,
          unitPrice: Number(line.unitPrice),
          discountPct: Number(line.discountPct ?? 0),
          lineTotal:
            Math.max(1, Math.trunc(Number(line.qty))) *
            Number(line.unitPrice) *
            (1 - Number(line.discountPct ?? 0) / 100),
        })),
      });
    }

    return prisma.quotation.update({
      where: { id },
      data: {
        customerId: data.customerId,
        status: data.status,
        validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
      },
      include: { lines: true, customer: true },
    });
  }

  async remove(id: string) {
    try {
      return await prisma.quotation.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error: unknown) {
      const code = error instanceof Error && 'code' in error
        ? (error as Error & { code: string }).code
        : undefined;
      if (code === 'P2025') {
        throw new NotFoundException(`Quotation with ID ${id} not found`);
      }
      throw error;
    }
  }
}
