import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type {
  CreateInspectionPlanDto, UpdateInspectionPlanDto, InspectionPlanQueryDto,
  CreateInspectionStepDto, CreateInspectionDto, UpdateInspectionDto, InspectionQueryDto,
  CreateNcrDto, UpdateNcrDto, NcrQueryDto, CreateCapaDto, UpdateCapaDto,
  CreateCertificateDto, UpdateCertificateDto, CertificateQueryDto,
} from './dto/quality.dto';

const prisma = new PrismaClient() as any;

@Injectable()
export class QualityService {
  // ---- Inspection Plans ----

  async createPlan(dto: CreateInspectionPlanDto) {
    const { steps, ...data } = dto;
    return prisma.inspectionPlan.create({
      data: {
        ...data,
        name: `Inspection plan for ${data.productId}`,
        version: data.version ?? 1,
        status: data.status ?? 'active',
        steps: {
          create: steps.map((s) => ({
            seq: s.seq,
            name: s.name,
            type: s.type,
            specMin: s.specMin,
            specMax: s.specMax,
            uom: s.uom,
            method: s.method,
            samplingPlan: s.samplingPlan ?? undefined,
          })),
        },
      },
      include: { steps: { orderBy: { seq: 'asc' } } },
    });
  }

  async findAllPlans(query: InspectionPlanQueryDto) {
    const { page = 1, limit = 20, status, companyId, productId } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (companyId) where.companyId = companyId;
    if (productId) where.productId = productId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.inspectionPlan.findMany({
        where, skip, take: limit,
        include: { steps: { orderBy: { seq: 'asc' } }, _count: { select: { steps: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.inspectionPlan.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOnePlan(id: string) {
    const plan = await prisma.inspectionPlan.findUnique({
      where: { id },
      include: { steps: { orderBy: { seq: 'asc' } } },
    });
    if (!plan) throw new NotFoundException(`Inspection plan ${id} not found`);
    return plan;
  }

  async updatePlan(id: string, dto: UpdateInspectionPlanDto) {
    const existing = await prisma.inspectionPlan.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Inspection plan ${id} not found`);

    const { steps, ...data } = dto;
    if (steps) {
      await prisma.inspectionStep.deleteMany({ where: { planId: id } });
      await prisma.inspectionStep.createMany({
        data: steps.map((s) => ({
          planId: id,
          seq: s.seq,
          name: s.name,
          type: s.type,
          specMin: s.specMin,
          specMax: s.specMax,
          uom: s.uom,
          method: s.method,
          samplingPlan: s.samplingPlan ?? undefined,
        })),
      });
    }

    return prisma.inspectionPlan.update({
      where: { id },
      data,
      include: { steps: { orderBy: { seq: 'asc' } } },
    });
  }

  async removePlan(id: string) {
    try {
      await prisma.inspectionPlan.delete({ where: { id } });
      return { deleted: true };
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') {
        throw new NotFoundException(`Inspection plan ${id} not found`);
      }
      throw error;
    }
  }

  async addPlanStep(planId: string, dto: CreateInspectionStepDto) {
    const plan = await prisma.inspectionPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException(`Inspection plan ${planId} not found`);
    return prisma.inspectionStep.create({
      data: {
        planId,
        seq: dto.seq,
        name: dto.name,
        type: dto.type,
        specMin: dto.specMin,
        specMax: dto.specMax,
        uom: dto.uom,
        method: dto.method,
        samplingPlan: dto.samplingPlan ?? undefined,
      },
    });
  }

  async removePlanStep(planId: string, stepId: string) {
    try {
      await prisma.inspectionStep.delete({ where: { id: stepId, planId } });
      return { deleted: true };
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') {
        throw new NotFoundException(`Step ${stepId} not found in plan ${planId}`);
      }
      throw error;
    }
  }

  // ---- Inspections ----

  async createInspection(dto: CreateInspectionDto) {
    const step = await prisma.inspectionStep.findUnique({
      where: { id: dto.stepId },
      include: { plan: true },
    });
    if (!step) throw new NotFoundException(`Inspection step ${dto.stepId} not found`);
    return prisma.qualityInspection.create({
      data: {
        companyId: step.plan.companyId,
        operationId: dto.operationId ?? step.plan.routingOpId ?? 'unassigned',
        productionOrderId: dto.productionOrderId,
        planId: step.planId,
        stepId: dto.stepId,
        inspectorId: dto.inspectorId,
        status: dto.status,
        measurementValue: dto.value ?? undefined,
        result: dto.result,
        timestamp: new Date(),
      },
      include: { ncr: true },
    });
  }

  async findAllInspections(query: InspectionQueryDto) {
    const { page = 1, limit = 20, status, productionOrderId, inspectorId } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (productionOrderId) where.productionOrderId = productionOrderId;
    if (inspectorId) where.inspectorId = inspectorId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.qualityInspection.findMany({
        where, skip, take: limit,
        include: { ncr: true },
        orderBy: { timestamp: 'desc' },
      }),
      prisma.qualityInspection.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOneInspection(id: string) {
    const inspection = await prisma.qualityInspection.findUnique({
      where: { id },
      include: { ncr: { include: { capa: true } } },
    });
    if (!inspection) throw new NotFoundException(`Inspection ${id} not found`);
    return inspection;
  }

  async updateInspection(id: string, dto: UpdateInspectionDto) {
    try {
      return await prisma.qualityInspection.update({
        where: { id },
        data: {
          status: dto.status,
          measurementValue: dto.value ?? undefined,
          result: dto.result,
          ncrId: dto.ncrId,
          imageUrls: dto.images ?? undefined,
        },
        include: { ncr: true },
      });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') {
        throw new NotFoundException(`Inspection ${id} not found`);
      }
      throw error;
    }
  }

  // ---- NCRs ----

  async createNcr(dto: CreateNcrDto) {
    const inspection = await prisma.qualityInspection.findUnique({ where: { id: dto.inspectionId } });
    if (!inspection) throw new NotFoundException(`Inspection ${dto.inspectionId} not found`);
    const ncr = await prisma.nonconformance.create({
      data: {
        companyId: inspection.companyId,
        inspectionId: dto.inspectionId,
        type: dto.type,
        severity: dto.severity,
        disposition: dto.disposition,
        rootCause: dto.rootCause,
        correctiveAction: dto.correctiveAction,
        status: dto.status,
      },
      include: { inspection: true },
    });

    await prisma.qualityInspection.update({
      where: { id: dto.inspectionId },
      data: { ncrId: ncr.id },
    });

    return ncr;
  }

  async findAllNcrs(query: NcrQueryDto) {
    const { page = 1, limit = 20, status, disposition, inspectionId } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (inspectionId) where.inspectionId = inspectionId;
    if (status) where.status = status;
    if (disposition) where.disposition = disposition;

    const [data, total] = await Promise.all([
      prisma.nonconformance.findMany({
        where, skip, take: limit,
        include: { inspection: true, capa: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.nonconformance.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOneNcr(id: string) {
    const ncr = await prisma.nonconformance.findUnique({
      where: { id },
      include: { inspection: true, capa: true },
    });
    if (!ncr) throw new NotFoundException(`NCR ${id} not found`);
    return ncr;
  }

  async updateNcr(id: string, dto: UpdateNcrDto) {
    try {
      return await prisma.nonconformance.update({
        where: { id },
        data: dto,
        include: { inspection: true, capa: true },
      });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') {
        throw new NotFoundException(`NCR ${id} not found`);
      }
      throw error;
    }
  }

  async dispositionNcr(ncrId: string, dto: { disposition: string; dispositionedBy: string }) {
    try {
      return await prisma.nonconformance.update({
        where: { id: ncrId },
        data: { disposition: dto.disposition, dispositionedBy: dto.dispositionedBy, dispositionedAt: new Date(), status: 'DISPOSITIONED' },
        include: { inspection: true, capa: true },
      });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') {
        throw new NotFoundException(`NCR ${ncrId} not found`);
      }
      throw error;
    }
  }

  // ---- CAPA ----

  async createCapa(ncrId: string, dto: CreateCapaDto) {
    const ncr = await prisma.nonconformance.findUnique({ where: { id: ncrId } });
    if (!ncr) throw new NotFoundException(`NCR ${ncrId} not found`);

    return prisma.correctiveAction.create({
      data: {
        companyId: ncr.companyId,
        ncrId,
        description: dto.description,
        ownerId: dto.ownerId,
        dueDate: new Date(dto.dueDate),
      },
      include: { ncr: true },
    });
  }

  async updateCapa(ncrId: string, dto: UpdateCapaDto) {
    const capa = await prisma.correctiveAction.findUnique({ where: { ncrId } });
    if (!capa) throw new NotFoundException(`CAPA for NCR ${ncrId} not found`);

    return prisma.correctiveAction.update({
      where: { ncrId },
      data: {
        description: dto.description,
        ownerId: dto.ownerId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        completedAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
        verifiedAt: dto.verifiedAt ? new Date(dto.verifiedAt) : undefined,
        verifiedBy: dto.verifiedBy,
      },
      include: { ncr: true },
    });
  }

  // ---- Certificates ----

  async createCertificate(dto: CreateCertificateDto) {
    const diamond = await prisma.diamond.findUnique({ where: { id: dto.diamondId } });
    if (!diamond) throw new NotFoundException(`Diamond ${dto.diamondId} not found`);
    return prisma.certificate.create({
      data: {
        companyId: diamond.companyId,
        diamondId: dto.diamondId,
        labId: dto.labId,
        certificateNo: dto.certificateNo,
        issueDate: new Date(dto.issueDate),
        pdfUrl: dto.pdfUrl,
        validatedAt: dto.validatedAt ? new Date(dto.validatedAt) : undefined,
        validatedBy: dto.validatedBy,
      },
    });
  }

  async findAllCertificates(query: CertificateQueryDto) {
    const { page = 1, limit = 20, diamondId, labId, certificateNo } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (diamondId) where.diamondId = diamondId;
    if (labId) where.labId = labId;
    if (certificateNo) where.certificateNo = { contains: certificateNo };

    const [data, total] = await Promise.all([
      prisma.certificate.findMany({
        where, skip, take: limit,
        orderBy: { issueDate: 'desc' },
      }),
      prisma.certificate.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOneCertificate(id: string) {
    const cert = await prisma.certificate.findUnique({
      where: { id },
    });
    if (!cert) throw new NotFoundException(`Certificate ${id} not found`);
    return cert;
  }

  async updateCertificate(id: string, dto: UpdateCertificateDto) {
    try {
      return await prisma.certificate.update({
        where: { id },
        data: {
          ...dto,
          validatedAt: dto.validatedAt ? new Date(dto.validatedAt) : undefined,
        },
      });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') {
        throw new NotFoundException(`Certificate ${id} not found`);
      }
      throw error;
    }
  }

  async validateCertificate(id: string, validatedBy: string) {
    try {
      return await prisma.certificate.update({
        where: { id },
        data: { validatedAt: new Date(), validatedBy },
      });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') {
        throw new NotFoundException(`Certificate ${id} not found`);
      }
      throw error;
    }
  }
}
