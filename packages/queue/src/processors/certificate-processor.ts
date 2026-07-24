import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Processor('certificates')
export class CertificateProcessor {
  async process(job: any): Promise<void> {
    const { certificateId } = job.data;
    console.log(`Polling certificate ${certificateId}`);

    try {
      const cert = await prisma.certificate.findUnique({
        where: { id: certificateId },
      });

      if (!cert) {
        throw new Error(`Certificate ${certificateId} not found`);
      }

      // In a real implementation, call the lab's API
      const externalStatus = await this.checkLabApi(cert.labId, cert.certificateNo);

      if (externalStatus === 'AVAILABLE') {
        await prisma.certificate.update({
          where: { id: certificateId },
          data: {
            status: 'RECEIVED',
            pdfUrl: `https://lab.example.com/certificates/${cert.certificateNo}.pdf`,
          },
        });

        // Check if we should validate automatically
        if (cert.validatedAt === null) {
          // Trigger validation job
        }
      } else if (externalStatus === 'REJECTED') {
        await prisma.certificate.update({
          where: { id: certificateId },
          data: { status: 'REJECTED' },
        });
      }

      console.log(`Certificate ${certificateId} status: ${externalStatus}`);
    } catch (error) {
      console.error(`Certificate polling failed:`, error);
      throw error;
    }
  }

  private async checkLabApi(labId: string, certificateNo: string): Promise<'PENDING' | 'AVAILABLE' | 'REJECTED'> {
    // In a real implementation, call the lab's API
    // For now, simulate
    const statuses = ['PENDING', 'AVAILABLE', 'REJECTED'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }
}