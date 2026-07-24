import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { CreateDiamondDto, UpdateDiamondDto, QueryDiamondDto, CreatePacketDto, UpdatePacketDto } from './dto/manufacturing.dto';

const prisma = new PrismaClient() as any;

@Injectable()
export class DiamondsService {
  async create(dto: CreateDiamondDto) {
    return prisma.diamond.create({
      data: { ...dto, status: 'ROUGH' },
      include: { certificate: true },
    });
  }

  async findAll(query: QueryDiamondDto) {
    const { page = 1, limit = 20, search, status, currentPacketId, companyId } = query;
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };
    if (companyId) where.companyId = companyId;
    if (status) where.status = status;
    if (currentPacketId) where.currentPacketId = currentPacketId;
    if (search) {
      where.OR = [{ certificateNo: { contains: search, mode: 'insensitive' } }];
    }

    const [data, total] = await Promise.all([
      prisma.diamond.findMany({ where, skip, take: limit, include: { certificate: true }, orderBy: { createdAt: 'desc' } }),
      prisma.diamond.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const diamond = await prisma.diamond.findUnique({ where: { id }, include: { certificate: true, events: { orderBy: { timestamp: 'desc' } } } });
    if (!diamond || diamond.deletedAt) throw new NotFoundException(`Diamond ${id} not found`);
    return diamond;
  }

  async update(id: string, dto: UpdateDiamondDto) {
    try {
      return await prisma.diamond.update({ where: { id }, data: dto, include: { certificate: true } });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') throw new NotFoundException(`Diamond ${id} not found`);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await prisma.diamond.update({ where: { id }, data: { deletedAt: new Date() } });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') throw new NotFoundException(`Diamond ${id} not found`);
      throw error;
    }
  }

  async createPacket(dto: CreatePacketDto) {
    return prisma.diamondPacket.create({ data: { ...dto, status: 'ACTIVE' } });
  }

  async findAllPackets(query: { page?: number; limit?: number; factoryId?: string; status?: string }) {
    const { page = 1, limit = 20, factoryId, status } = query;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (factoryId) where.factoryId = factoryId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.diamondPacket.findMany({ where, skip, take: limit, include: { _count: { select: { diamonds: true } } }, orderBy: { createdAt: 'desc' } }),
      prisma.diamondPacket.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOnePacket(id: string) {
    const packet = await prisma.diamondPacket.findUnique({ where: { id }, include: { diamonds: { include: { certificate: true } } } });
    if (!packet) throw new NotFoundException(`Packet ${id} not found`);
    return packet;
  }

  async updatePacket(id: string, dto: UpdatePacketDto) {
    try {
      return await prisma.diamondPacket.update({ where: { id }, data: dto });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') throw new NotFoundException(`Packet ${id} not found`);
      throw error;
    }
  }
}
