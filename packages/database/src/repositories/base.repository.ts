import { prisma, setOrgScope } from '../prisma-client.js';
import { AggregateRoot, Repository, OrganizationScope } from '@diamondflow/domain';
import { Prisma } from '@prisma/client';

export abstract class BaseRepository<T extends AggregateRoot, TModel, TCreateInput, TUpdateInput, TWhereUniqueInput, TWhereInput>
  implements Repository<T> {
  protected abstract modelDelegate: PrismaClient['$extends']['modelDelegate'] | any;
  protected abstract modelName: string;

  protected get client() {
    return prisma;
  }

  async findById(id: string, scope?: OrganizationScope): Promise<T | null> {
    if (scope) setOrgScope(scope);
    try {
      const record = await this.modelDelegate.findUnique({ where: { id } });
      return record ? this.toDomain(record) : null;
    } finally {
      if (scope) setOrgScope({});
    }
  }

  async findMany(
    where?: TWhereInput,
    options?: { orderBy?: Record<string, 'asc' | 'desc'>; take?: number; skip?: number },
    scope?: OrganizationScope
  ): Promise<T[]> {
    if (scope) setOrgScope(scope);
    try {
      const records = await this.modelDelegate.findMany({
        where: where as any,
        orderBy: options?.orderBy,
        take: options?.take,
        skip: options?.skip,
      });
      return records.map((r) => this.toDomain(r));
    } finally {
      if (scope) setOrgScope({});
    }
  }

  async findFirst(
    where?: TWhereInput,
    scope?: OrganizationScope
  ): Promise<T | null> {
    if (scope) setOrgScope(scope);
    try {
      const record = await this.modelDelegate.findFirst({ where: where as any });
      return record ? this.toDomain(record) : null;
    } finally {
      if (scope) setOrgScope({});
    }
  }

  async create(data: TCreateInput, scope?: OrganizationScope): Promise<T> {
    if (scope) setOrgScope(scope);
    try {
      const record = await this.modelDelegate.create({ data: data as any });
      return this.toDomain(record);
    } finally {
      if (scope) setOrgScope({});
    }
  }

  async update(where: TWhereUniqueInput, data: TUpdateInput, scope?: OrganizationScope): Promise<T> {
    if (scope) setOrgScope(scope);
    try {
      const record = await this.modelDelegate.update({ where: where as any, data: data as any });
      return this.toDomain(record);
    } finally {
      if (scope) setOrgScope({});
    }
  }

  async softDelete(id: string, scope?: OrganizationScope): Promise<void> {
    if (scope) setOrgScope(scope);
    try {
      await this.modelDelegate.update({ where: { id }, data: { deletedAt: new Date() } });
    } finally {
      if (scope) setOrgScope({});
    }
  }

  async delete(id: string, scope?: OrganizationScope): Promise<void> {
    if (scope) setOrgScope(scope);
    try {
      await this.modelDelegate.delete({ where: { id } });
    } finally {
      if (scope) setOrgScope({});
    }
  }

  async count(where?: TWhereInput, scope?: OrganizationScope): Promise<number> {
    if (scope) setOrgScope(scope);
    try {
      return await this.modelDelegate.count({ where: where as any });
    } finally {
      if (scope) setOrgScope({});
    }
  }

  async exists(where: TWhereUniqueInput, scope?: OrganizationScope): Promise<boolean> {
    if (scope) setOrgScope(scope);
    try {
      const record = await this.modelDelegate.findUnique({ where: where as any });
      return !!record;
    } finally {
      if (scope) setOrgScope({});
    }
  }

  protected abstract toDomain(record: TModel): T;
}