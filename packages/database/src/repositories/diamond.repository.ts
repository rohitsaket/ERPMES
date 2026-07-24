import { BaseRepository } from './base.repository.js';
import { Diamond, DiamondRepository as DiamondRepositoryInterface } from '@diamondflow/domain';
import { Prisma } from '@prisma/client';

export class DiamondRepository extends BaseRepository<
  Diamond,
  Prisma.DiamondGetPayload<{}>,
  Prisma.DiamondCreateInput,
  Prisma.DiamondUpdateInput,
  Prisma.DiamondWhereUniqueInput,
  Prisma.DiamondWhereInput
> implements DiamondRepositoryInterface {
  protected modelDelegate = prisma.diamond;
  protected modelName = 'Diamond';

  async findByPacket(packetId: string): Promise<Diamond[]> {
    const records = await this.client.diamond.findMany({
      where: { currentPacketId: packetId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
    return records.map((r) => this.toDomain(r));
  }

  async findByGenealogy(parentDiamondId: string): Promise<Diamond[]> {
    const records = await this.client.diamond.findMany({
      where: { parentDiamondId, deletedAt: null },
    });
    return records.map((r) => this.toDomain(r));
  }

  async findByStatus(status: string, scope?: { companyId?: string }): Promise<Diamond[]> {
    const records = await this.client.diamond.findMany({
      where: { status, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) => this.toDomain(r));
  }

  async findUnallocated(scope?: { companyId?: string }): Promise<Diamond[]> {
    const records = await this.client.diamond.findMany({
      where: { status: 'unallocated', deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) => this.toDomain(r));
  }

  async findByCertificateNo(certificateNo: string): Promise<Diamond | null> {
    const record = await this.client.diamond.findUnique({
      where: { certificateNo },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByDepartment(departmentId: string): Promise<Diamond[]> {
    const records = await this.client.diamond.findMany({
      where: { currentDeptId: departmentId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
    return records.map((r) => this.toDomain(r));
  }

  async getGenealogy(diamondId: string) {
    return this.client.diamondEvent.findMany({
      where: { diamondId },
      orderBy: { timestamp: 'asc' },
    });
  }

  protected toDomain(record: any): Diamond {
    return {
      id: record.id,
      companyId: record.companyId,
      certificateNo: record.certificateNo,
      carat: record.carat?.toNumber(),
      color: record.color,
      clarity: record.clarity,
      cut: record.cut,
      shape: record.shape,
      origin: record.origin,
      status: record.status,
      currentOwnerId: record.currentOwnerId,
      currentPacketId: record.currentPacketId,
      currentDeptId: record.currentDeptId,
      currentEmployeeId: record.currentEmployeeId,
      currentMachineId: record.currentMachineId,
      parentDiamondId: record.parentDiamondId,
      notes: record.notes,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
    };
  }
}