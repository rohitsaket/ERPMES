import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateVendorDto, UpdateVendorDto, VendorQueryDto, VendorStatus } from './dto/vendor.dto';

const prisma = new PrismaClient() as any;

@Injectable()
export class VendorsService {
  
  async getDashboard(companyId: string) {
    if (!companyId) throw new BadRequestException('Company ID required');
    const [total, active, pending, inactive, blocked] = await Promise.all([
      prisma.vendor.count({ where: { companyId, deletedAt: null } }),
      prisma.vendor.count({ where: { companyId, status: 'ACTIVE', deletedAt: null } }),
      prisma.vendor.count({ where: { companyId, status: 'PENDING', deletedAt: null } }),
      prisma.vendor.count({ where: { companyId, status: 'INACTIVE', deletedAt: null } }),
      prisma.vendor.count({ where: { companyId, status: 'BLOCKED', deletedAt: null } }),
    ]);

    return { total, active, pending, inactive, blocked };
  }

  async getStatistics(companyId: string) {
    // For a real app, this would calculate growth. We'll return the raw counts needed for accurate percentages.
    return this.getDashboard(companyId);
  }

  async getTopCategories(companyId: string) {
    if (!companyId) return [];
    
    try {
      const categories = await (prisma as any).vendorCategory.findMany({
        where: { companyId },
        take: 5,
      });

      const totalVendors = await prisma.vendor.count({ where: { companyId, deletedAt: null } });

      return categories.map((c: any) => ({
        id: c.id,
        name: c.name,
        count: 0,
        percent: 0,
      }));
    } catch {
      return [];
    }
  }

  async getTopVendors(companyId: string) {
    if (!companyId) return [];

    try {
      const topVendors = await prisma.vendor.findMany({
        where: { companyId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, code: true }
      });

      return topVendors.map((v: any) => ({
        ...v,
        amount: `₹ 0`
      }));
    } catch {
      return [];
    }
  }

  async importVendors(data: any[]) {
    // Simple bulk create simulation
    let count = 0;
    for (const row of data) {
      if (row.companyId && row.code && row.name) {
        await prisma.vendor.upsert({
          where: { companyId_code: { companyId: row.companyId, code: row.code } },
          update: { name: row.name },
          create: { ...row, status: row.status || 'ACTIVE' }
        });
        count++;
      }
    }
    return { success: true, count };
  }

  async exportVendors(query: VendorQueryDto) {
    const { data } = await this.findAll({ ...query, limit: 10000 });
    if (!data.length) return "Code,Name,Email,Status\n";

    const header = "Code,Name,Email,Mobile,Status,Credit Limit,Outstanding Balance\n";
    const rows = data.map((v: any) => 
      `${v.code},"${v.name}",${v.email || ''},${v.mobile || ''},${v.status},${v.creditLimit},${v.outstandingBalance}`
    ).join("\n");

    return header + rows;
  }

  async bulkDelete(ids: string[]) {
    const result = await prisma.vendor.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: new Date() }
    });
    return { success: true, count: result.count };
  }

  async create(createVendorDto: CreateVendorDto) {
    try {
      return await prisma.vendor.create({
        data: {
          name: createVendorDto.name,
          code: createVendorDto.code,
          email: createVendorDto.email,
          phone: createVendorDto.phone,
          mobile: createVendorDto.mobile,
          gstNumber: createVendorDto.gstNumber,
          panNumber: createVendorDto.panNumber,
          vendorType: createVendorDto.vendorType,
          status: createVendorDto.status || 'ACTIVE',
          creditLimit: createVendorDto.creditLimit,
          paymentTerms: createVendorDto.paymentTerms,
          categoryId: createVendorDto.categoryId,
          contactInfo: createVendorDto.contactInfo || {},
          address: createVendorDto.address || {},
          rating: createVendorDto.rating,
          companyId: createVendorDto.companyId,
        },
      });
    } catch (error: unknown) {
      const code = error instanceof Error && 'code' in error ? (error as any).code : undefined;
      if (code === 'P2002') throw new ConflictException('Vendor code already exists');
      throw error;
    }
  }

  async findAll(query: VendorQueryDto) {
    const { page = 1, limit = 20, search, companyId, status, categoryId } = query;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (companyId) where.companyId = companyId;
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { gstNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { category: true }
      }),
      prisma.vendor.count({ where }),
    ]);

    return {
      data,
      meta: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: { category: true, transactions: true, payments: true }
    });

    if (!vendor || vendor.deletedAt) throw new NotFoundException(`Vendor with ID ${id} not found`);
    return vendor;
  }

  async update(id: string, updateVendorDto: UpdateVendorDto) {
    try {
      return await prisma.vendor.update({
        where: { id },
        data: {
          name: updateVendorDto.name,
          code: updateVendorDto.code,
          email: updateVendorDto.email,
          phone: updateVendorDto.phone,
          mobile: updateVendorDto.mobile,
          gstNumber: updateVendorDto.gstNumber,
          panNumber: updateVendorDto.panNumber,
          vendorType: updateVendorDto.vendorType,
          status: updateVendorDto.status,
          creditLimit: updateVendorDto.creditLimit,
          paymentTerms: updateVendorDto.paymentTerms,
          categoryId: updateVendorDto.categoryId,
          contactInfo: updateVendorDto.contactInfo,
          address: updateVendorDto.address,
          rating: updateVendorDto.rating,
        },
      });
    } catch (error: unknown) {
      const code = error instanceof Error && 'code' in error ? (error as any).code : undefined;
      if (code === 'P2002') throw new ConflictException('Vendor code already exists');
      if (code === 'P2025') throw new NotFoundException(`Vendor with ID ${id} not found`);
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
      const code = error instanceof Error && 'code' in error ? (error as any).code : undefined;
      if (code === 'P2025') throw new NotFoundException(`Vendor with ID ${id} not found`);
      throw error;
    }
  }
}
