import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { JobProcessor, JobContext, MrpJobData } from '../jobs/job-types';

const prisma = new PrismaClient();

@Processor('mrp')
export class MrpProcessor implements JobProcessor {
  async process(job: Job<MrpJobData>, context: JobContext): Promise<void> {
    const { companyId, runId } = job.data;
    console.log(`Running MRP for company ${companyId}`);

    const run = await prisma.mrpRun.create({
      data: {
        companyId,
        status: 'RUNNING',
      },
    });

    try {
      // Get all active products for the company
      const products = await prisma.product.findMany({
        where: { companyId, deletedAt: null },
      });

      let processedCount = 0;
      const exceptions: any[] = [];

      for (const product of products) {
        try {
          // Calculate net requirements
          const demand = await this.calculateDemand(prisma, product.id);
          const supply = await this.calculateSupply(prisma, product.id);
          const available = supply - demand;

          if (available < 0) {
            // Create planned order
            await prisma.plannedOrder.create({
              data: {
                mrpRunId: run.id,
                itemId: product.id,
                qty: Math.abs(available),
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
                supplyType: 'MANUFACTURE',
                pegging: { productId: product.id, demand: Math.abs(available) },
              },
            });
          }
          processedCount++;
        } catch (error) {
          exceptions.push({ productId: product.id, error: (error as Error).message });
        }
      }

      await prisma.mrpRun.update({
        where: { id: run.id },
        data: {
          status: 'COMPLETED',
          recordsProcessed: processedCount,
          exceptions: exceptions.length > 0 ? exceptions : null,
          completedAt: new Date(),
        },
      });

      console.log(`MRP completed for company ${companyId}: ${processedCount} items processed, ${exceptions.length} exceptions`);
    } catch (error) {
      await prisma.mrpRun.update({
        where: { id: run.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
        },
      });
      throw error;
    }
  }

  private async calculateDemand(prisma: PrismaClient, itemId: string): Promise<number> {
    const salesOrderLines = await prisma.salesOrderLine.findMany({
      where: { productId: itemId, productionOrderId: null },
    });
    return salesOrderLines.reduce((sum, line) => sum + line.qty, 0);
  }

  private async calculateSupply(prisma: PrismaClient, itemId: string): Promise<number> {
    const lots = await prisma.inventoryLot.findMany({
      where: { itemId, status: 'AVAILABLE' },
    });
    return lots.reduce((sum, lot) => sum + lot.qty, 0);
  }
}
