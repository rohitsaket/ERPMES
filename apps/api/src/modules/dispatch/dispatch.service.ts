import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type {
  CreateBagDto, UpdateBagDto, BagQueryDto,
  CreateShipmentDto, UpdateShipmentDto, ShipmentQueryDto,
  CreateCarrierDto, UpdateCarrierDto, CarrierQueryDto,
} from './dto/dispatch.dto';

const prisma = new PrismaClient() as any;

@Injectable()
export class DispatchService {
  // ---- Bags ----

  async createBag(dto: CreateBagDto) {
    const existing = await prisma.bag.findUnique({ where: { sealNo: dto.sealNo } });
    if (existing) throw new ConflictException(`Bag with seal no ${dto.sealNo} already exists`);
    return prisma.bag.create({
      data: { ...dto, status: dto.status ?? 'ACTIVE' },
      include: { diamonds: { select: { id: true, certificateNo: true, carat: true } } },
    });
  }

  async findAllBags(query: BagQueryDto) {
    const { page = 1, limit = 20, status, shipmentId } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (shipmentId) where.shipmentId = shipmentId;

    const [data, total] = await Promise.all([
      prisma.bag.findMany({
        where, skip, take: limit,
        include: { _count: { select: { diamonds: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.bag.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOneBag(id: string) {
    const bag = await prisma.bag.findUnique({
      where: { id },
      include: { diamonds: true, shipment: { select: { id: true, trackingNo: true, status: true } } },
    });
    if (!bag) throw new NotFoundException(`Bag ${id} not found`);
    return bag;
  }

  async updateBag(id: string, dto: UpdateBagDto) {
    try {
      return await prisma.bag.update({ where: { id }, data: dto, include: { diamonds: { select: { id: true, certificateNo: true } } } });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') throw new NotFoundException(`Bag ${id} not found`);
      throw error;
    }
  }

  // ---- Shipments ----

  async createShipment(dto: CreateShipmentDto) {
    return prisma.shipment.create({
      data: {
        ...dto,
        number: `SHP-${Date.now()}`,
        status: 'draft',
      },
      include: { bags: true, trackingEntries: true },
    });
  }

  async findAllShipments(query: ShipmentQueryDto) {
    const { page = 1, limit = 20, status, companyId, customerId } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (companyId) where.companyId = companyId;
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.shipment.findMany({
        where, skip, take: limit,
        include: { _count: { select: { bags: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.shipment.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOneShipment(id: string) {
    const shipment = await prisma.shipment.findUnique({
      where: { id },
      include: {
        bags: { include: { diamonds: { select: { id: true, certificateNo: true } } } },
        trackingEntries: { orderBy: { timestamp: 'desc' } },
        salesOrder: true,
      },
    });
    if (!shipment) throw new NotFoundException(`Shipment ${id} not found`);
    return shipment;
  }

  async updateShipment(id: string, dto: UpdateShipmentDto) {
    try {
      return await prisma.shipment.update({
        where: { id },
        data: dto,
        include: { bags: true, trackingEntries: true },
      });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') throw new NotFoundException(`Shipment ${id} not found`);
      throw error;
    }
  }

  async dispatchShipment(id: string) {
    try {
      return await prisma.shipment.update({
        where: { id },
        data: { status: 'DISPATCHED', dispatchedAt: new Date() },
        include: { bags: true, trackingEntries: true },
      });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') throw new NotFoundException(`Shipment ${id} not found`);
      throw error;
    }
  }

  async deliverShipment(id: string) {
    try {
      return await prisma.shipment.update({
        where: { id },
        data: { status: 'DELIVERED', deliveredAt: new Date() },
        include: { bags: true, trackingEntries: true },
      });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') throw new NotFoundException(`Shipment ${id} not found`);
      throw error;
    }
  }

  async addTrackingEvent(shipmentId: string, dto: { status: string; location?: string }) {
    const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
    if (!shipment) throw new NotFoundException(`Shipment ${shipmentId} not found`);
    return prisma.shipmentTracking.create({
      data: { shipmentId, status: dto.status, location: dto.location, timestamp: new Date() },
    });
  }

  // ---- Carriers ----

  async createCarrier(dto: CreateCarrierDto) {
    const existing = await prisma.carrier.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException(`Carrier with code ${dto.code} already exists`);
    return prisma.carrier.create({ data: dto });
  }

  async findAllCarriers(query: CarrierQueryDto) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.carrier.findMany({ skip, take: limit, orderBy: { name: 'asc' } }),
      prisma.carrier.count(),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOneCarrier(id: string) {
    const carrier = await prisma.carrier.findUnique({ where: { id } });
    if (!carrier) throw new NotFoundException(`Carrier ${id} not found`);
    return carrier;
  }

  async updateCarrier(id: string, dto: UpdateCarrierDto) {
    try {
      return await prisma.carrier.update({ where: { id }, data: dto });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') throw new NotFoundException(`Carrier ${id} not found`);
      throw error;
    }
  }
}
