import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClerkClient, ClerkClient } from '@clerk/clerk-sdk-node';

@Injectable()
export class ClerkService implements OnModuleInit {
  private client: ClerkClient;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.client = createClerkClient({
      secretKey: this.configService.get<string>('CLERK_SECRET_KEY'),
      publishableKey: this.configService.get<string>('CLERK_PUBLISHABLE_KEY'),
    });
  }

  getClient(): ClerkClient {
    return this.client;
  }

  async getUser(userId: string) {
    return this.client.users.getUser(userId);
  }

  async getOrganization(orgId: string) {
    return this.client.organizations.getOrganization(orgId);
  }

  async createOrganization(data: { name: string; createdBy: string }) {
    return this.client.organizations.createOrganization(data);
  }

  async updateOrganization(orgId: string, data: Partial<{ name: string; slug: string; logoUrl: string }>) {
    return this.client.organizations.updateOrganization(orgId, data);
  }

  async deleteOrganization(orgId: string) {
    return this.client.organizations.deleteOrganization(orgId);
  }

  async createOrganizationMembership(data: { organizationId: string; userId: string; role: string }) {
    return this.client.organizationMemberships.createOrganizationMembership(data);
  }

  async updateOrganizationMembership(membershipId: string, data: { role: string }) {
    return this.client.organizationMemberships.updateOrganizationMembership(membershipId, data);
  }

  async deleteOrganizationMembership(membershipId: string) {
    return this.client.organizationMemberships.deleteOrganizationMembership(membershipId);
  }

  async createInvitation(data: { emailAddress: string; organizationId: string; role: string }) {
    return this.client.invitations.createInvitation(data);
  }

  async revokeInvitation(invitationId: string) {
    return this.client.invitations.revokeInvitation(invitationId);
  }
}