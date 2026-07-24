import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient() as any;

@Injectable()
export class WorkCentersService {
  async create(createWorkCenterDto: any) {
    try {
      return await prisma.workCenter.create({
        data: {
          name: createWorkCenterDto.name,
          type: createWorkCenterDto.type,
          capacity: createWorkCenterDto.capacity,
          oeeTarget: createWorkCenterDto.oeeTarget ?? 0.85,
          companyId: createWorkCenterDto.companyId,
          departmentId: createWorkCenterDto.departmentId,
        },
      });
    } catch (error: unknown) {
      const code = error instanceof Error && 'code' in error
        ? (error as Error & { code: string }).code
        : undefined;
      if (code === 'P2002') {
        throw new ConflictException('Work center name already exists in this department');
      }
      throw error;
    }
  }

  async findAll(query: any) {
    const { page = 1, limit = 20, search, type, companyId, departmentId } = query;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (companyId) where.companyId = companyId;
    if (departmentId) where.departmentId = departmentId;
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.workCenter.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.workCenter.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const workCenter = await prisma.workCenter.findUnique({
      where: { id },
    });

    if (!workCenter || workCenter.deletedAt) {
      throw new NotFoundException(`Work center with ID ${id} not found`);
    }

    return workCenter;
  }

  async update(id: string, updateWorkCenterDto: any) {
    try {
      return await prisma.workCenter.update({
        where: { id },
        data: {
          name: updateWorkCenterDto.name,
          type: updateWorkCenterDto.type,
          capacity: updateWorkCenterDto.capacity,
          oeeTarget: updateWorkCenterDto.oeeTarget,
        },
      });
    } catch (error: unknown) {
      const code = error instanceof Error && 'code' in error
        ? (error as Error & { code: string }).code
        : undefined;
      if (code === 'P2002') {
        throw new ConflictException('Work center name already exists in this department');
      }
      if (code === 'P2025') {
        throw new NotFoundException(`Work center with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await prisma.workCenter.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error: unknown) {
      const code = error instanceof Error && 'code' in error
        ? (error as Error & { code: string }).code
        : undefined;
      if (code === 'P2025') {
        throw new NotFoundException(`Work center with ID ${id} not found`);
      }
      throw error;
    }
  }
}
