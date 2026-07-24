import type { SalesOrder, Prisma } from "@prisma/client";
import { BaseRepository } from "./base.repository.js";
import type { RepositoryFindManyArgs, RepositoryFindByIdArgs } from "./base.repository.js";

export interface ISalesOrderRepository {
  findById(args: RepositoryFindByIdArgs): Promise<SalesOrder | null>;
  findMany(args: RepositoryFindManyArgs<{ companyId: string }>): Promise<SalesOrder[]>;
  create(args: Prisma.SalesOrderCreateInput): Promise<SalesOrder>;
  update(args: { companyId: string; id: string } & Partial<Prisma.SalesOrderUpdateInput>): Promise<SalesOrder>;
  softDelete(args: { companyId: string; id: string }): Promise<SalesOrder>;
  findByCustomer(args: { companyId: string; customerId: string; skip?: number; take?: number }): Promise<SalesOrder[]>;
  findByStatus(args: { companyId: string; status: string; skip?: number; take?: number }): Promise<SalesOrder[]>;
  findByNumber(args: { number: string }): Promise<SalesOrder | null>;
}

type SalesOrderCreateInput = Prisma.SalesOrderCreateInput;
type SalesOrderUpdateInput = Prisma.SalesOrderUpdateInput;

export class SalesOrderRepository extends BaseRepository<SalesOrder, SalesOrderCreateInput, SalesOrderUpdateInput> implements ISalesOrderRepository {
  constructor() {
    super("SalesOrder");
  }

  async findByCustomer(args: {
    companyId: string;
    customerId: string;
    skip?: number;
    take?: number;
  }): Promise<SalesOrder[]> {
    try {
      return await this.findMany({
        companyId: args.companyId,
        customerId: args.customerId,
        skip: args.skip,
        take: args.take,
      } as RepositoryFindManyArgs<{ companyId: string; customerId: string }>);
    } catch (error) {
      throw new Error(
        `SalesOrderRepository.findByCustomer failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async findByStatus(args: {
    companyId: string;
    status: string;
    skip?: number;
    take?: number;
  }): Promise<SalesOrder[]> {
    try {
      return await this.findMany({
        companyId: args.companyId,
        status: args.status,
        skip: args.skip,
        take: args.take,
      } as RepositoryFindManyArgs<{ companyId: string; status: string }>);
    } catch (error) {
      throw new Error(
        `SalesOrderRepository.findByStatus failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async findByNumber(args: { number: string }): Promise<SalesOrder | null> {
    try {
      const delegate = this.getDelegate() as {
        findUnique: (args: {
          where: { number: string };
        }) => Promise<SalesOrder | null>;
      };
      return await delegate.findUnique({ where: { number: args.number } });
    } catch (error) {
      throw new Error(
        `SalesOrderRepository.findByNumber failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

export const salesOrderRepository = new SalesOrderRepository();