import type { InventoryLot, Prisma } from "@prisma/client";
import { BaseRepository } from "./base.repository.js";
import type { RepositoryFindManyArgs, RepositoryFindByIdArgs } from "./base.repository.js";

export interface IInventoryLotRepository {
  findById(args: RepositoryFindByIdArgs): Promise<InventoryLot | null>;
  findMany(args: RepositoryFindManyArgs<{ companyId: string }>): Promise<InventoryLot[]>;
  create(args: Prisma.InventoryLotCreateInput): Promise<InventoryLot>;
  update(args: { companyId: string; id: string } & Partial<Prisma.InventoryLotUpdateInput>): Promise<InventoryLot>;
  softDelete(args: { companyId: string; id: string }): Promise<InventoryLot>;
  findByItem(args: { companyId: string; itemId: string; skip?: number; take?: number }): Promise<InventoryLot[]>;
  findByWarehouse(args: { companyId: string; warehouseId: string; skip?: number; take?: number }): Promise<InventoryLot[]>;
  findAvailable(args: { companyId: string; itemId: string; skip?: number; take?: number }): Promise<InventoryLot[]>;
  findByLotNumber(args: { companyId: string; lotNumber: string }): Promise<InventoryLot | null>;
}

type InventoryLotCreateInput = Prisma.InventoryLotCreateInput;
type InventoryLotUpdateInput = Prisma.InventoryLotUpdateInput;

export class InventoryLotRepository extends BaseRepository<InventoryLot, InventoryLotCreateInput, InventoryLotUpdateInput> implements IInventoryLotRepository {
  constructor() {
    super("InventoryLot");
  }

  async findByItem(args: {
    companyId: string;
    itemId: string;
    skip?: number;
    take?: number;
  }): Promise<InventoryLot[]> {
    try {
      return await this.findMany({
        companyId: args.companyId,
        itemId: args.itemId,
        skip: args.skip,
        take: args.take,
      } as RepositoryFindManyArgs<{ companyId: string; itemId: string }>);
    } catch (error) {
      throw new Error(
        `InventoryLotRepository.findByItem failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async findByWarehouse(args: {
    companyId: string;
    warehouseId: string;
    skip?: number;
    take?: number;
  }): Promise<InventoryLot[]> {
    try {
      return await this.findMany({
        companyId: args.companyId,
        warehouseId: args.warehouseId,
        skip: args.skip,
        take: args.take,
      } as RepositoryFindManyArgs<{ companyId: string; warehouseId: string }>);
    } catch (error) {
      throw new Error(
        `InventoryLotRepository.findByWarehouse failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async findAvailable(args: {
    companyId: string;
    itemId: string;
    skip?: number;
    take?: number;
  }): Promise<InventoryLot[]> {
    try {
      return await this.findMany({
        companyId: args.companyId,
        itemId: args.itemId,
        status: "available",
        skip: args.skip,
        take: args.take,
      } as RepositoryFindManyArgs<{
        companyId: string;
        itemId: string;
        status: string;
      }>);
    } catch (error) {
      throw new Error(
        `InventoryLotRepository.findAvailable failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async findByLotNumber(args: {
    companyId: string;
    lotNumber: string;
  }): Promise<InventoryLot | null> {
    try {
      const delegate = this.getDelegate() as {
        findUnique: (args: {
          where: {
            companyId_lotNumber: { companyId: string; lotNumber: string };
          };
        }) => Promise<InventoryLot | null>;
      };
      return await delegate.findUnique({
        where: {
          companyId_lotNumber: {
            companyId: args.companyId,
            lotNumber: args.lotNumber,
          },
        },
      });
    } catch (error) {
      throw new Error(
        `InventoryLotRepository.findByLotNumber failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

export const inventoryLotRepository = new InventoryLotRepository();