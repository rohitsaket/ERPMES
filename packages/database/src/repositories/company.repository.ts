import { BaseRepository } from './base.repository.js';
import { Company, CompanyRepository as CompanyRepositoryInterface } from '@diamondflow/domain';
import { Prisma } from '@prisma/client';

export class CompanyRepository extends BaseRepository<
  Company,
  Prisma.CompanyGetPayload<{}>,
  Prisma.CompanyCreateInput,
  Prisma.CompanyUpdateInput,
  Prisma.CompanyWhereUniqueInput,
  Prisma.CompanyWhereInput
> implements CompanyRepositoryInterface {
  protected modelDelegate = prisma.company;
  protected modelName = 'Company';

  async findByCode(code: string, scope?: { companyId?: string }): Promise<Company | null> {
    const record = await this.client.company.findUnique({ where: { code } });
    return record ? this.toDomain(record) : null;
  }

  async findByName(name: string, scope?: { companyId?: string }): Promise<Company[]> {
    const records = await this.client.company.findMany({
      where: { name: { contains: name, mode: 'insensitive' }, deletedAt: null },
    });
    return records.map((r) => this.toDomain(r));
  }

  async findActiveCompanies(): Promise<Company[]> {
    const records = await this.client.company.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) => this.toDomain(r));
  }

  protected toDomain(record: any): Company {
    return {
      id: record.id,
      name: record.name,
      code: record.code,
      settings: record.settings,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
    };
  }
}