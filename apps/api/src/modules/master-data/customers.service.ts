import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type {
  CreateCustomerDto,
  CustomerQueryDto,
  UpdateCustomerDto,
} from './dto/customer.dto';

const prisma = new PrismaClient() as any;

@Injectable()
export class CustomersService {
  async create(createCustomerDto: CreateCustomerDto) {
    try {
      return await prisma.customer.create({
        data: {
          name: createCustomerDto.name,
          code: createCustomerDto.code,
          creditLimit: createCustomerDto.creditLimit ?? 0,
          paymentTerms: createCustomerDto.paymentTerms,
          address: createCustomerDto.address || {},
          contactInfo: createCustomerDto.contactInfo || {},
          companyId: createCustomerDto.companyId,
        },
      });
    } catch (error: unknown) {
      const code = error instanceof Error && 'code' in error
        ? (error as Error & { code: string }).code
        : undefined;
      if (code === 'P2002') {
        throw new ConflictException('Customer code already exists for this company');
      }
      throw error;
    }
  }

  async findAll(query: CustomerQueryDto) {
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
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer || customer.deletedAt) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    try {
      return await prisma.customer.update({
        where: { id },
        data: {
          name: updateCustomerDto.name,
          code: updateCustomerDto.code,
          creditLimit: updateCustomerDto.creditLimit,
          paymentTerms: updateCustomerDto.paymentTerms,
          address: updateCustomerDto.address,
          contactInfo: updateCustomerDto.contactInfo,
        },
      });
    } catch (error: unknown) {
      const code = error instanceof Error && 'code' in error
        ? (error as Error & { code: string }).code
        : undefined;
      if (code === 'P2002') {
        throw new ConflictException('Customer code already exists for this company');
      }
      if (code === 'P2025') {
        throw new NotFoundException(`Customer with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await prisma.customer.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error: unknown) {
      const code = error instanceof Error && 'code' in error
        ? (error as Error & { code: string }).code
        : undefined;
      if (code === 'P2025') {
        throw new NotFoundException(`Customer with ID ${id} not found`);
      }
      throw error;
    }
  }
}
