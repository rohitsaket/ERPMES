import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { createClerkClient, type ClerkClient } from '@clerk/clerk-sdk-node';

const prisma = new PrismaClient();

@Injectable()
export class ClerkWebhookHandler {
  private readonly logger = new Logger(ClerkWebhookHandler.name);
  private clerkClient: ClerkClient;

  constructor() {
    this.clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
  }

  async handleUserCreated(payload: any): Promise<void> {
    const { data } = payload;
    
    const user = await prisma.user.upsert({
      where: { clerkId: data.id },
      update: {
        email: data.email_addresses[0]?.email_address,
        firstName: data.first_name,
        lastName: data.last_name,
        deletedAt: null,
        lastLogin: new Date(),
      },
      create: {
        clerkId: data.id,
        email: data.email_addresses[0]?.email_address,
        firstName: data.first_name,
        lastName: data.last_name,
        role: 'operator',
        permissions: [],
        settings: {},
      },
    });

    this.logger.log(`User synced: ${user.email} (${user.clerkId})`);
  }

  async handleUserUpdated(payload: any): Promise<void> {
    const { data } = payload;
    
    await prisma.user.update({
      where: { clerkId: data.id },
      data: {
        email: data.email_addresses[0]?.email_address,
        firstName: data.first_name,
        lastName: data.last_name,
        deletedAt: data.banned ? new Date() : null,
      },
    });

    this.logger.log(`User updated: ${data.id}`);
  }

  async handleUserDeleted(payload: any): Promise<void> {
    const { data } = payload;
    
    await prisma.user.update({
      where: { clerkId: data.id },
      data: { deletedAt: new Date() },
    });

    this.logger.log(`User deactivated: ${data.id}`);
  }

  async handleOrganizationCreated(payload: any): Promise<void> {
    const { data } = payload;
    
    const company = await prisma.company.upsert({
      where: { code: data.slug.toUpperCase() },
      update: { name: data.name },
      create: {
        name: data.name,
        code: data.slug.toUpperCase(),
        settings: {},
      },
    });

    this.logger.log(`Organization synced: ${company.name} (${company.code})`);
  }

  async handleOrganizationUpdated(payload: any): Promise<void> {
    const { data } = payload;
    
    await prisma.company.update({
      where: { code: data.slug.toUpperCase() },
      data: { name: data.name },
    });

    this.logger.log(`Organization updated: ${data.id}`);
  }

  async handleOrganizationDeleted(payload: any): Promise<void> {
    const { data } = payload;
    
    await prisma.company.update({
      where: { code: data.slug.toUpperCase() },
      data: { deletedAt: new Date() },
    });

    this.logger.log(`Organization deactivated: ${data.id}`);
  }

  async handleOrganizationMembershipCreated(payload: any): Promise<void> {
    const { data } = payload;
    
    const user = await prisma.user.findUnique({ where: { clerkId: data.public_user_data.user_id } });
    const company = await prisma.company.findUnique({ where: { code: data.organization.slug.toUpperCase() } });

    if (user && company) {
      // Update user's company association
      await prisma.user.update({
        where: { id: user.id },
        data: {
          // Add role based on membership role
        },
      });
    }

    this.logger.log(`Membership created: ${data.public_user_data.user_id} -> ${data.organization.slug}`);
  }

  async handleOrganizationMembershipUpdated(payload: any): Promise<void> {
    const { data } = payload;
    this.logger.log(`Membership updated: ${data.id}`);
  }

  async handleOrganizationMembershipDeleted(payload: any): Promise<void> {
    const { data } = payload;
    this.logger.log(`Membership deleted: ${data.id}`);
  }

  async syncAllUsers(): Promise<void> {
    try {
      const users = await this.clerkClient.users.getUserList({ limit: 500 });
      
      for (const user of users.data) {
        await this.handleUserCreated({ data: user });
      }

      this.logger.log(`Synced ${users.data.length} users from Clerk`);
    } catch (error) {
      this.logger.error('Failed to sync users from Clerk', error);
      throw error;
    }
  }
}
