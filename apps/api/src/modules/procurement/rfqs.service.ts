import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import type { CreateRfqDto, UpdateRfqDto, QueryRfqDto } from './dto/rfq.dto';

const prisma = new PrismaClient();

@Injectable()
export class RfqsService {
  async create(dto: CreateRfqDto) {
    const { lines, ...data } = dto;
    return prisma.rfq.create({
      data: {
        companyId: data.companyId,
        vendorId: data.vendorId,
        number: `RFQ-${randomUUID().slice(0, 8).toUpperCase()}`,
        status: 'draft',
        dueDate: new Date(data.dueDate),
        lines: {
          create: lines.map(({ itemName: _itemName, ...line }) => line),
        },
      },
      include: { lines: true, vendor: true },
    });
  }

  async findAll(query: QueryRfqDto) {
    const { page = 1, limit = 20, status, vendorId, companyId } = query;
    const skip = (page - 1) * limit;
    const where: { companyId?: string; status?: string; vendorId?: string } = {};
    if (companyId) where.companyId = companyId;
    if (status) where.status = status;
    if (vendorId) where.vendorId = vendorId;

    const [data, total] = await Promise.all([
      prisma.rfq.findMany({ where, skip, take: limit, include: { lines: true, vendor: true }, orderBy: { createdAt: 'desc' } }),
      prisma.rfq.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const rfq = await prisma.rfq.findUnique({ where: { id }, include: { lines: true, vendor: true } });
    if (!rfq) throw new NotFoundException(`RFQ ${id} not found`);
    return rfq;
  }

  async update(id: string, dto: UpdateRfqDto) {
    try {
      return await prisma.rfq.update({
        where: { id },
        data: { status: dto.status, dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined },
        include: { lines: true, vendor: true },
      });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') throw new NotFoundException(`RFQ ${id} not found`);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await prisma.rfq.delete({ where: { id } });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') throw new NotFoundException(`RFQ ${id} not found`);
      throw error;
    }
  }

  async send(id: string) {
    try {
      return await prisma.rfq.update({
        where: { id },
        data: { status: 'sent', sentAt: new Date() },
        include: { lines: true, vendor: true },
      });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') throw new NotFoundException(`RFQ ${id} not found`);
      throw error;
    }
  }
}
