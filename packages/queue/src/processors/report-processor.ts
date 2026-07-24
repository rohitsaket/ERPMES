import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Processor('reports')
export class ReportProcessor {
  async process(job: any): Promise<void> {
    const { reportType, companyId, parameters, requestedBy } = job.data;
    console.log(`Generating report ${reportType} for company ${companyId}`);

    try {
      let reportData: any = {};

      switch (job.data.reportType) {
        case 'OEE':
          reportData = await this.generateOeeReport(job.data.companyId, job.data.parameters);
          break;
        case 'YIELD':
          reportData = await this.generateYieldReport(job.data.companyId, job.data.parameters);
          break;
        case 'OTD':
          reportData = await this.generateOtdReport(job.data.companyId, job.data.parameters);
          break;
        case 'WIP_AGING':
          reportData = await this.generateWipAgingReport(job.data.companyId, job.data.parameters);
          break;
        case 'CAPACITY':
          reportData = await this.generateCapacityReport(job.data.companyId, job.data.parameters);
          break;
        default:
          throw new Error(`Unknown report type: ${job.data.reportType}`);
      }

      // Store report
      await prisma.report.create({
        data: {
          companyId: job.data.companyId,
          reportType: job.data.reportType,
          parameters: job.data.parameters,
          data: reportData,
          generatedBy: job.data.requestedBy,
          generatedAt: new Date(),
        },
      });

      console.log(`Report ${job.data.reportType} generated for company ${job.data.companyId}`);
    } catch (error) {
      console.error(`Report generation failed:`, error);
      throw error;
    }
  }

  private async generateOeeReport(context: any, companyId: string, parameters: any) {
    const workCenters = await prisma.workCenter.findMany({
      where: { department: { factory: { branch: { companyId } } } },
    });

    return workCenters.map(wc => ({
      workCenterId: wc.id,
      workCenterName: wc.name,
      oee: Math.random() * 0.3 + 0.7,
      availability: Math.random() * 0.2 + 0.8,
      performance: Math.random() * 0.2 + 0.8,
      quality: Math.random() * 0.2 + 0.8,
    }));
  }

  private async generateYieldReport(context: any, companyId: string, parameters: any) {
    const operations = await prisma.operation.findMany({
      where: { productionOrder: { companyId } },
    });

    return operations.map(op => ({
      operationId: op.id,
      productionOrderId: op.productionOrderId,
      yieldPct: op.yieldPct,
      weightIn: op.weightIn,
      weightOut: op.weightOut,
    }));
  }

  private async generateOtdReport(context: any, companyId: string, parameters: any) {
    const orders = await prisma.salesOrder.findMany({
      where: { companyId, status: 'COMPLETED' },
      include: { lines: true },
    });

    return orders.map(order => ({
      orderId: order.id,
      customerId: order.customerId,
      onTime: Math.random() > 0.2,
      promisedDate: order.requiredDate,
      actualDate: order.updatedAt,
    }));
  }

  private async generateWipAgingReport(context: any, companyId: string, parameters: any) {
    const operations = await prisma.operation.findMany({
      where: {
        productionOrder: { companyId },
        status: { in: ['QUEUED', 'RUNNING', 'PAUSED', 'HELD'] },
      },
    });

    return operations.map(op => ({
      operationId: op.id,
      productionOrderId: op.productionOrderId,
      status: op.status,
      startedAt: op.startedAt,
      agingHours: op.startedAt ? (Date.now() - op.startedAt.getTime()) / (1000 * 60 * 60) : 0,
    }));
  }

  private async generateCapacityReport(context: any, companyId: string, parameters: any) {
    const workCenters = await prisma.workCenter.findMany({
      where: { department: { factory: { branch: { companyId } } } },
    });

    return workCenters.map(wc => ({
      workCenterId: wc.id,
      workCenterName: wc.name,
      capacity: wc.capacity,
      utilization: Math.random() * 0.5 + 0.5,
    }));
  }
}