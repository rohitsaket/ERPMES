import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Processor('maintenance')
export class MaintenanceProcessor {
  async process(job: any): Promise<void> {
    const { assetId } = job.data;
    console.log(`Creating maintenance work order for asset ${assetId}`);

    try {
      const asset = await prisma.asset.findUnique({
        where: { id: assetId },
        include: { pmSchedule: true },
      });

      if (!asset) {
        throw new Error(`Asset ${assetId} not found`);
      }

      const workOrder = await prisma.workOrder.create({
        data: {
          assetId,
          type: 'PREVENTIVE',
          priority: 'MEDIUM',
          status: 'OPEN',
          dueDate: new Date(),
          tasks: {
            create: asset.pmSchedule?.tasks?.map((task: any, index: number) => ({
              seq: index + 1,
              description: task.description,
              estimatedHours: task.estimatedHours || 1,
            })) || [],
          },
        },
      });

      // Update PM schedule
      if (asset.pmSchedule) {
        await prisma.preventiveMaintenanceSchedule.update({
          where: { id: asset.pmSchedule.id },
          data: {
            lastRun: new Date(),
            nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
          },
        });
      }

      console.log(`Maintenance work order ${workOrder.id} created for asset ${assetId}`);
    } catch (error) {
      console.error(`Maintenance due processing failed:`, error);
      throw error;
    }
  }
}
