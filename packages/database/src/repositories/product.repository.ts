import { BaseRepository } from './base.repository.js';
import { Product, ProductRepository as ProductRepositoryInterface } from '@diamondflow/domain';
import { Prisma } from '@prisma/client';

export class ProductRepository extends BaseRepository<
  Product,
  Prisma.ProductGetPayload<{}>,
  Prisma.ProductCreateInput,
  Prisma.ProductUpdateInput,
  Prisma.ProductWhereUniqueInput,
  Prisma.ProductWhereInput
> implements ProductRepositoryInterface {
  protected modelDelegate = prisma.product;
  protected modelName = 'Product';

  async findBySku(sku: string, scope?: { companyId?: string }): Promise<Product | null> {
    const record = await this.client.product.findFirst({
      where: { sku, deletedAt: null },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByCategory(category: string, scope?: { companyId?: string }): Promise<Product[]> {
    const records = await this.client.product.findMany({
      where: { category, deletedAt: null },
    });
    return records.map((r) => this.toDomain(r));
  }

  async findActive(): Promise<Product[]> {
    const records = await this.client.product.findMany({
      where: { status: 'active', deletedAt: null },
      orderBy: { name: 'asc' },
    });
    return records.map((r) => this.toDomain(r));
  }

  protected toDomain(record: any): Product {
    return {
      id: record.id,
      companyId: record.companyId,
      sku: record.sku,
      name: record.name,
      description: record.description,
      category: record.category,
      type: record.type,
      uom: record.uom,
      weight: record.weight?.toNumber(),
      imageUrl: record.imageUrl,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
    };
  }
}