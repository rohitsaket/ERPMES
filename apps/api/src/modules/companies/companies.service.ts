import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient() as any;

@Injectable()
export class CompaniesService {
  async create(createCompanyDto: any) {
    try {
      return await prisma.company.create({
        data: {
          name: createCompanyDto.name,
          code: createCompanyDto.code,
          settings: createCompanyDto.settings || {},
        },
      });
    } catch (error: unknown) {
      const code = error instanceof Error && 'code' in error
        ? (error as Error & { code: string }).code
        : undefined;
      if (code === 'P2002') {
        throw new ConflictException('Company code already exists');
      }
      throw error;
    }
  }

  async findAll(query: any) {
    const { page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } },
          ],
          deletedAt: null,
        }
      : { deletedAt: null };

    const [data, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          branches: { where: { deletedAt: null } },
          _count: { select: { factories: true, users: true } },
        },
      }),
      prisma.company.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        branches: {
          where: { deletedAt: null },
          include: {
            factories: { where: { deletedAt: null } },
            warehouses: { where: { deletedAt: null } },
          },
        },
        factories: { where: { deletedAt: null } },
        warehouses: { where: { deletedAt: null } },
        departments: { where: { deletedAt: null } },
        users: { where: { isActive: true } },
        _count: {
          select: {
            branches: true,
            factories: true,
            warehouses: true,
            users: true,
            products: true,
            salesOrders: true,
            purchaseOrders: true,
            shipments: true,
            invoices: true,
          },
        },
      },
    });

    if (!company || company.deletedAt) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
  }

  async update(id: string, updateCompanyDto: any) {
    try {
      const company = await prisma.company.update({
        where: { id },
        data: {
          name: updateCompanyDto.name,
          settings: updateCompanyDto.settings,
        },
      });
      return company;
    } catch (error: unknown) {
      const code = error instanceof Error && 'code' in error
        ? (error as Error & { code: string }).code
        : undefined;
      if (code === 'P2002') {
        throw new ConflictException('Company code already exists');
      }
      if (code === 'P2025') {
        throw new NotFoundException(`Company with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await prisma.company.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error: unknown) {
      const code = error instanceof Error && 'code' in error
        ? (error as Error & { code: string }).code
        : undefined;
      if (code === 'P2025') {
        throw new NotFoundException(`Company with ID ${id} not found`);
      }
      throw error;
    }
  }
}
