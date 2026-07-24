import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient() as any;

@Injectable()
export class VendorsService {
  async create(createVendorDto: any) {
    try {
      return await prisma.vendor.create({
        data: {
          name: createVendorDto.name,
          code: createVendorDto.code,
          contactInfo: createVendorDto.contactInfo || {},
          address: createVendorDto.address || {},
          rating: createVendorDto.rating,
          companyId: createVendorDto.companyId,
        },
      });
    } catch (error: unknown) {
      const code = error instanceof Error && 'code' in error
        ? (error as Error & { code: string }).code
        : undefined;
      if (code === 'P2002') {
        throw new ConflictException('Vendor code already exists for this company');
      }
      throw error;
    }
  }

  async findAll(query: any) {
    const { page = 1, limit = 20, search, companyId } = query;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (companyId) where.companyId = companyId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vendor.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const vendor = await prisma.vendor.findUnique({
      where: { id },
    });

    if (!vendor || vendor.deletedAt) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }

    return vendor;
  }

  async update(id: string, updateVendorDto: any) {
    try {
      return await prisma.vendor.update({
        where: { id },
        data: {
          name: updateVendorDto.name,
          code: updateVendorDto.code,
          contactInfo: updateVendorDto.contactInfo,
          address: updateVendorDto.address,
          rating: updateVendorDto.rating,
        },
      });
    } catch (error: unknown) {
      const code = error instanceof Error && 'code' in error
        ? (error as Error & { code: string }).code
        : undefined;
      if (code === 'P2002') {
        throw new ConflictException('Vendor code already exists for this company');
      }
      if (code === 'P2025') {
        throw new NotFoundException(`Vendor with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await prisma.vendor.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error: unknown) {
      const code = error instanceof Error && 'code' in error
        ? (error as Error & { code: string }).code
        : undefined;
      if (code === 'P2025') {
        throw new NotFoundException(`Vendor with ID ${id} not found`);
      }
      throw error;
    }
  }
}
