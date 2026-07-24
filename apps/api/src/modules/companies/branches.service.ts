import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient() as any;

@Injectable()
export class BranchesService {
  async findAll(query: any) {
    const { page = 1, limit = 20, search, companyId } = query;
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      ...(companyId && { companyId }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { code: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.branch.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          factories: { where: { deletedAt: null } },
          warehouses: { where: { deletedAt: null } },
          _count: { select: { factories: true, warehouses: true } },
        },
      }),
      prisma.branch.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const branch = await prisma.branch.findUnique({
      where: { id },
      include: {
        company: true,
        factories: { where: { deletedAt: null } },
        warehouses: { where: { deletedAt: null } },
        _count: { select: { factories: true, warehouses: true } },
      },
    });

    if (!branch || branch.deletedAt) {
      throw new Error(`Branch with ID ${id} not found`);
    }

    return branch;
  }

  async create(data: any) {
    return prisma.branch.create({ data });
  }

  async update(id: string, data: any) {
    try {
      return await prisma.branch.update({
        where: { id },
        data,
      });
    } catch (error: unknown) {
      const code = error instanceof Error && 'code' in error
        ? (error as Error & { code: string }).code
        : undefined;
      if (code === 'P2002') {
        throw new Error('Branch code already exists in this company');
      }
      if (code === 'P2025') {
        throw new Error(`Branch with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await prisma.branch.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error: unknown) {
      const code = error instanceof Error && 'code' in error
        ? (error as Error & { code: string }).code
        : undefined;
      if (code === 'P2025') {
        throw new Error(`Branch with ID ${id} not found`);
      }
      throw error;
    }
  }
}
