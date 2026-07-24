import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Processor('notifications')
export class NotificationProcessor {
  async process(job: any): Promise<void> {
    const { userId, digestType } = job.data;
    console.log(`Sending ${digestType} notification digest to user ${userId}`);

    try {
      const since = digestType === 'DAILY' 
        ? new Date(Date.now() - 24 * 60 * 60 * 1000)
        : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const notifications = await prisma.notification.findMany({
        where: {
          userId,
          createdAt: { gte: since },
          read: false,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (notifications.length === 0) {
        console.log(`No unread notifications for user ${userId}`);
        return;
      }

      // Group by type
      const grouped = notifications.reduce((acc, n) => {
        const key = n.type;
        if (!acc[key]) acc[key] = [];
        acc[key].push(n);
        return acc;
      }, {} as Record<string, any[]>);

      // In a real implementation, send email/push notification
      const digest = {
        userId,
        digestType,
        total: notifications.length,
        byType: Object.fromEntries(
          Object.entries(grouped).map(([type, items]) => [type, items.length])
        ),
        items: notifications.map(n => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          createdAt: n.createdAt,
        })),
      };

      console.log(`Notification digest sent to user ${userId}: ${notifications.length} notifications`);

      // Mark as read
      await prisma.notification.updateMany({
        where: { id: { in: notifications.map(n => n.id) } },
        data: { read: true },
      });
    } catch (error) {
      console.error(`Notification digest failed:`, error);
      throw error;
    }
  }
}