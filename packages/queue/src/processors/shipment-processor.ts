import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Processor('shipments')
export class ShipmentProcessor {
  async process(job: any): Promise<void> {
    const { shipmentId, carrierId } = job.data;
    console.log(`Tracking shipment ${shipmentId} via carrier ${carrierId}`);

    try {
      const shipment = await prisma.shipment.findUnique({
        where: { id: shipmentId },
        include: { bags: { include: { diamonds: true } } },
      });

      if (!shipment) {
        throw new Error(`Shipment ${shipmentId} not found`);
      }

      // In a real implementation, call carrier API
      const trackingInfo = await this.trackWithCarrier(carrierId, shipment.trackingNo);

      await prisma.shipment.update({
        where: { id: shipmentId },
        data: {
          status: trackingInfo.status,
          tracking: {
            create: {
              status: trackingInfo.status,
              location: trackingInfo.location,
              timestamp: new Date(),
              rawData: trackingInfo.rawData,
            },
          },
          deliveredAt: trackingInfo.status === 'DELIVERED' ? new Date() : undefined,
        },
      });

      // Update bag statuses
      if (trackingInfo.status === 'DELIVERED') {
        await prisma.bag.updateMany({
          where: { shipmentId },
          data: { status: 'DELIVERED' },
        });

        // Update diamonds
        await prisma.diamond.updateMany({
          where: { bag: { shipmentId } },
          data: { status: 'SOLD' },
        });

        // Update diamond current owner
        await prisma.diamond.updateMany({
          where: { bag: { shipmentId } },
          data: { currentOwnerId: shipment.customerId },
        });
      }

      console.log(`Shipment ${shipmentId} status updated to ${trackingInfo.status}`);
    } catch (error) {
      console.error(`Shipment tracking failed:`, error);
      throw error;
    }
  }

  private async trackWithCarrier(carrierId: string, trackingNo: string): Promise<{ status: string; location: string; rawData: any }> {
    // In a real implementation, call the carrier's API
    const statuses = ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const locations = ['Warehouse', 'Sorting Facility', 'Local Depot', 'Out for Delivery', 'Delivered'];
    
    return {
      status: statuses[Math.floor(Math.random() * statuses.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      rawData: { carrierId, trackingNo, timestamp: new Date() },
    };
  }
}
